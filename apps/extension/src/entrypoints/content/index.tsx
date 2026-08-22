import $ from "jquery";
import { render } from "solid-js/web";
import { defineContentScript } from "#imports";
import { getGoogleDomains } from "@/assets/googledomains";
import Popup from "@/entrypoints/content/components/popup";
import { getResults, type Results } from "@/utils/filter";
import { items, type RankingsV2 } from "@/utils/storage";
import { getPageTheme } from "@/utils/theme";

const LOG_PREFIX = "[SearchTuner]";

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
	console.log(`${LOG_PREFIX} sorting`, {
		total: results.length,
		reorderable: results.filter((result) => result.canReorder).length,
		blocked: results.filter(
			(result) => rankings?.[result.domain]?.type === "block",
		).length,
	});

	results
		.filter((result) => rankings?.[result.domain]?.type === "block")
		.forEach((result) => {
			result.element.remove();
		});

	const reorderableResults = results.filter((result) => result.canReorder);
	const rankedResults = orderedResults(reorderableResults, rankings);
	reorderResults(rankedResults);
}

function addPopupContainers(searches: Results) {
	console.log(`${LOG_PREFIX} decorating results`, {
		count: searches.length,
		results: searches.map((search) => ({
			domain: search.domain,
			text: search.text,
			element: search.element[0],
		})),
	});

	const theme = getPageTheme();
	const template = document.createElement("div");
	template.classList.add("searchtuner-container");
	template.setAttribute("data-theme", theme);

	searches.forEach((search, index) => {
		// Ensure the parent is positioned relatively so absolute works
		const parent = search.element[0];
		if (getComputedStyle(parent).position === "static") {
			parent.style.position = "relative";
		}

		const container = template.cloneNode(true);
		parent.appendChild(container);
		render(() => <Popup {...search} />, container);
		console.log(`${LOG_PREFIX} decorated result ${index + 1}`, {
			domain: search.domain,
			result: parent,
			container,
		});
	});
}

function hideMain() {
	const style = document.createElement("style");
	style.id = "searchtuner-hide-main";
	style.textContent = "#main{visibility:hidden !important;}";
	(document.head || document.documentElement).appendChild(style);
}

function showMain() {
	const style = document.getElementById("searchtuner-hide-main");
	if (style) style.remove();
}

const getConfig = async () => {
	const [rankings_active, rankings] = await Promise.all([
		items.rankings_active.getValue(),
		items.rankings.getValue(),
	]);
	return { rankings_active, rankings };
};

async function main(config: {
	rankings_active: boolean;
	rankings: RankingsV2 | null;
}) {
	console.log(`${LOG_PREFIX} main`, {
		url: location.href,
		rankingsActive: config.rankings_active,
		rankingCount: config.rankings ? Object.keys(config.rankings).length : 0,
	});
	if (!config.rankings_active) {
		console.warn(`${LOG_PREFIX} rankings are disabled; skipping page`);
		return;
	}
	const searches = await getResults();
	sortResults(searches, config.rankings);
	addPopupContainers(searches);
	console.log(`${LOG_PREFIX} main complete`, {
		results: searches.length,
		decorations: document.querySelectorAll(".searchtuner-container").length,
	});
}

function runOnBody(condition: () => boolean, callback: () => void) {
	if (condition()) {
		console.log(`${LOG_PREFIX} #rso was already present`);
		callback();
	} else {
		console.log(`${LOG_PREFIX} waiting for #rso`);
		const observer = new MutationObserver((_mutations, obs) => {
			performance.mark("ST_mutationObserver");
			if (condition()) {
				console.log(`${LOG_PREFIX} found #rso after DOM mutation`);
				obs.disconnect(); // Stop observing once element is found
				callback();
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}
}

export default defineContentScript({
	matches: getGoogleDomains(),
	runAt: "document_start",
	main() {
		console.log(`${LOG_PREFIX} content script started`, {
			url: location.href,
			readyState: document.readyState,
		});
		hideMain();
		const configPromise = getConfig();
		configPromise.then((config) => {
			console.log(`${LOG_PREFIX} loaded config`, config);
		});
		// backup to show main if the config is not active
		configPromise.then((config) => {
			if (!config.rankings_active) showMain();
		});
		const timeout = setTimeout(() => showMain(), 1000);
		document.addEventListener("DOMContentLoaded", () => {
			console.log(`${LOG_PREFIX} DOMContentLoaded`);
			runOnBody(
				() => !!$("div#rso").length,
				() => {
					clearTimeout(timeout);
					configPromise
						.then((config) => main(config))
						.catch((error) => {
							console.error(`${LOG_PREFIX} main failed`, error);
						})
						.finally(() => showMain());
				},
			);
		});
	},
});
