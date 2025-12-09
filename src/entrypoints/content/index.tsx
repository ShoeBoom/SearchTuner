import { LiteDebouncer } from "@tanstack/pacer-lite";
import googledomains from "@/assets/googledomains";
import Popup from "@/entrypoints/content/components/popup";
import { getResults, type Results } from "@/utils/filter";
import { items } from "@/utils/storage";

const RERANK_WEIGHTS = {
	weak: 1,
	normal: 3,
	strong: 5,
} as const;

function orderedResults(results: Results, rankings: RankingsV2 | null) {
	const totalResults = results.length;

	return results
		.map((result, index) => {
			const rank = rankings?.[result.domain] ?? { type: "none" as const };
			const order = totalResults - index;

			const weight = RERANK_WEIGHTS[rank.strength ?? "normal"];

			switch (rank.type) {
				case "pin":
					return { ...result, ord: order + 9999, rank };
				case "raise":
					return { ...result, ord: order + weight, rank };
				case "none":
					return { ...result, ord: order, rank };
				case "lower":
					return { ...result, ord: order - weight, rank };
				case "block":
					result.element.remove();
					return null;
				// return { ...result, ord: order - 9999, rank };
				default:
					rank.type satisfies never;
					throw new Error("Invalid rank type");
			}
		})
		.filter((r) => r !== null);
}
function reorderResults(
	rankedResults: Awaited<ReturnType<typeof orderedResults>>,
) {
	const desiredNodes = rankedResults
		.slice()
		.sort((a, b) => b.ord - a.ord)
		.map((r) => r.element[0]);

	const swap = (a: HTMLElement, b: HTMLElement, ph: Comment) => {
		if (a === b) return;
		b.replaceWith(ph);
		a.replaceWith(b);
		ph.replaceWith(a);
	};

	const compareDom = (a: Node, b: Node) => {
		if (a === b) return 0;
		const pos = a.compareDocumentPosition(b);
		if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
		if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
		return 0;
	};

	const ph = document.createComment("");
	for (let i = 0; i < desiredNodes.length; i++) {
		const desired = desiredNodes[i];
		const currentOrder = desiredNodes.slice().sort(compareDom);
		if (currentOrder[i] === desired) continue;
		swap(currentOrder[i], desired, ph);
	}
}

function sortResults(results: Results, rankings: RankingsV2 | null) {
	const rankedResults = orderedResults(results, rankings);
	reorderResults(rankedResults);
}

function addPopupContainers(searches: Results) {
	const theme = getPageTheme();
	searches.forEach((search) => {
		// Ensure the parent is positioned relatively so absolute works
		const parent = search.element[0];
		if (getComputedStyle(parent).position === "static") {
			parent.style.position = "relative";
		}

		const container = document.createElement("div");
		container.classList.add("searchtuner-container");
		container.setAttribute("data-theme", theme);
		parent.appendChild(container);
		render(() => <Popup {...search} />, container);
	});
}

function hideMain() {
	const style = document.createElement("style");
	style.id = "searchtuner-hide-main";
	style.textContent = "#main{display:none !important;}";
	(document.head || document.documentElement).appendChild(style);
	performance.mark("ST_hideMain");
}

function showMain() {
	const style = document.getElementById("searchtuner-hide-main");
	if (style) style.remove();
	performance.mark("ST_showMain");
}

function script(rankings: RankingsV2 | null) {
	const searches = getResults();
	sortResults(searches, rankings);
	addPopupContainers(searches);
}
const getGoogleDomains = () => {
	return googledomains.map((domain) => `*://*${domain}/search*`);
};

const getConfig = async () => {
	const [rankings_active, rankings] = await Promise.all([
		items.rankings_active.getValue(),
		items.rankings.getValue(),
	]);
	return { rankings_active, rankings };
};

function main(config: {
	rankings_active: boolean;
	rankings: RankingsV2 | null;
}) {
	performance.mark("ST_startScript");
	if (!config.rankings_active) return;

	script(config.rankings);
}

function runOn(
	condition: () => boolean,
	callback: (observer: MutationObserver | null) => void,
	opts?: {
		element?: HTMLElement;
		obsOpt?: MutationObserverInit;
		disconnectOnFound?: boolean;
	},
) {
	if (condition()) {
		callback(null);
	} else {
		const observer = new MutationObserver((_mutations, obs) => {
			performance.mark("ST_mutationObserver");
			if (condition()) {
				(opts?.disconnectOnFound ?? true) && obs.disconnect(); // Stop observing once element is found
				callback(obs);
			}
		});
		observer.observe(opts?.element ?? document.body, opts?.obsOpt);
	}
}

function awaitBody(callback: () => void) {
	runOn(() => !!document.body, callback, {
		obsOpt: { childList: true },
		element: document.documentElement,
	});
}

const allTags =
	".vt6azd:not(.g-blk), .vCUuC, .sHEJob, [data-news-cluster-id], .eejeod";

const observerDebouncer = (
	condition: () => boolean,
	callback: (observer: MutationObserver | null) => void,
) => {
	let observer: MutationObserver | null = null;
	const time = performance.now();
	console.log("observerDebouncer", time);
	const debouncer = new LiteDebouncer(() => callback(observer), {
		wait: time,
	});
	if (condition()) {
		debouncer.maybeExecute();
	}
	observer = new MutationObserver((_mutations, _obs) => {
		if (condition()) {
			debouncer.maybeExecute();
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
	document.addEventListener("DOMContentLoaded", () => {
		debouncer.flush();
	});
};

export default defineContentScript({
	matches: getGoogleDomains(),
	runAt: "document_start",
	main() {
		hideMain();
		const configPromise = getConfig();
		// backup to show main if the config is not active
		configPromise.then((config) => {
			performance.mark("ST_configPromise");
			if (!config.rankings_active) showMain();
		});
		const timeout = setTimeout(() => showMain(), 2000);
		awaitBody(() => {
			performance.mark("ST_awaitBody");
			let count = 0;
			observerDebouncer(
				() => {
					const $rso = document.querySelector("div#rso");
					if ($rso === null) {
						console.error("Could not find result container #rso");
						return false;
					}
					const resultsCount = $rso.querySelectorAll(allTags).length;
					if (count !== resultsCount) {
						count = resultsCount;
						return true;
					}
					return false;
				},
				async (obs) => {
					obs?.disconnect();
					clearTimeout(timeout);
					main(await configPromise);
					showMain();
				},
			);
			// runOn(
			// 	() => {
			// 		const $rso = $("div#rso");
			// 		if ($rso.length === 0) {
			// 			console.error("Could not find result container #rso");
			// 			return false;
			// 		}
			// 		const results = $rso.find(allTags);
			// 		if (count === undefined || count !== results.length) {
			// 			console.log("results changed", results.length, performance.now());
			// 			// debouncer.maybeExecute();
			// 			count = results.length;
			// 		}
			// 		return results.length >= 5;
			// 	},
			// 	async () => {
			// 		clearTimeout(timeout);
			// 		main(await configPromise);
			// 		showMain();
			// 	},
			// 	{
			// 		obsOpt: {
			// 			childList: true,
			// 			subtree: true,
			// 		},
			// 	},
			// );
		});
	},
});
