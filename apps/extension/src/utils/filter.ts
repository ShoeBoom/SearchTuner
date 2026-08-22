import $ from "jquery";
import { err, ok } from "neverthrow";

const LOG_PREFIX = "[SearchTuner]";

// Keep these in sync with uBlacklist's desktop Google web selectors.
// https://github.com/ublacklist/builtin/blob/master/serpinfo/google.yml
const RESULT_SELECTORS = [
	{
		type: "result",
		root: ".vt6azd:not(.g-blk), .Ww4FFb",
		url: ":is(.yuRUbf, .xe8e1b) a",
		title: "h3",
	},
	{ type: "card", root: ".vCUuC", url: "a", title: ".Yt787" },
	{
		type: "card",
		root: ".sHEJob",
		url: 'a[href^="http"]',
		title: ".OSrXXb",
	},
	{
		type: "card",
		root: "[data-news-cluster-id]",
		url: "a",
		title: '[role="heading"][aria-level="3"]',
	},
	{ type: "card", root: ".eejeod", url: "a", title: "h3" },
	{
		type: "card",
		root: ".ivg-i:not(.my5z3d)",
		url: ".EZAeBe",
		title: ".OSrXXb",
	},
	{
		type: "card",
		root: ".ivg-i.my5z3d",
		url: ".LBcIee",
		title: ".ddBkwd",
	},
] as const;

const RESULT_ROOT_SELECTOR = RESULT_SELECTORS.map(({ root }) => root).join(
	", ",
);

export async function getResults() {
	const extracted = await extractDomains();
	const searches = extracted
		.map((s) => {
			return s.isOk() ? s.value : null;
		})
		.filter((s) => s !== null);

	console.log(`${LOG_PREFIX} parsed results`, {
		extracted: extracted.length,
		returned: searches.length,
		reorderable: searches.filter((result) => result.canReorder).length,
		cards: searches.filter((result) => !result.canReorder).length,
		results: searches.map((result) => ({
			domain: result.domain,
			domainSource: result.domainSource,
			text: result.text,
			canReorder: result.canReorder,
			element: result.element[0],
		})),
	});

	return searches;
}

export type Results = Awaited<ReturnType<typeof getResults>>;

async function extractDomains() {
	// Get the main results container
	const $rso = $("div#rso");
	if ($rso.length === 0) {
		console.error(`${LOG_PREFIX} could not find result container #rso`);
		return [];
	}

	const selectorCounts = RESULT_SELECTORS.map((selectors) => ({
		type: selectors.type,
		root: selectors.root,
		url: selectors.url,
		matches: $rso.find(selectors.root).length,
	}));
	console.log(`${LOG_PREFIX} selector scan`, {
		url: location.href,
		rso: $rso[0],
		combinedSelector: RESULT_ROOT_SELECTOR,
		selectorCounts,
	});
	console.table(selectorCounts);

	const blocks = $rso
		.find(RESULT_ROOT_SELECTOR)
		.map((_, element) => $(element))
		.toArray();
	console.log(`${LOG_PREFIX} matched DOM blocks`, {
		count: blocks.length,
		elements: blocks.map((block) => block[0]),
	});

	const results = await Promise.all(blocks.map(parseBlock));

	return results;
}

async function parseBlock(element: JQuery) {
	const selectors = RESULT_SELECTORS.find(({ root }) => element.is(root));
	if (!selectors) {
		console.warn(`${LOG_PREFIX} rejected block: no matching definition`, {
			element: element[0],
		});
		return err({
			error: "could_not_parse_domain" as const,
			element,
		});
	}

	const href = element.find(selectors.url).first().attr("href");
	const hrefDomain = href ? getHostname(href) : null;
	const cite = element.find("cite").first().text();
	const citeDomain =
		selectors.type === "result" ? getCitedHostname(cite) : null;
	const redirectDomain =
		href && !hrefDomain && !citeDomain
			? await getGoogleRedirectHostname(href)
			: null;
	const domain = hrefDomain ?? citeDomain ?? redirectDomain;

	if (!domain) {
		console.warn(`${LOG_PREFIX} rejected block: invalid or missing URL`, {
			type: selectors.type,
			rootSelector: selectors.root,
			urlSelector: selectors.url,
			href,
			cite,
			link: element.find(selectors.url).first()[0],
			element: element[0],
		});
		return err({
			error: "could_not_parse_domain" as const,
			element,
		});
	}

	return ok({
		domain,
		domainSource: hrefDomain
			? ("href" as const)
			: citeDomain
				? ("cite" as const)
				: ("redirect" as const),
		text: element.find(selectors.title).first().text(),
		// Rich result cards are safe to block individually, but moving them would
		// pull them out of their containing news, image, or video module.
		canReorder:
			selectors.type === "result" &&
			element.parents(selectors.root).length === 0,
		element,
	});
}

function getHostname(url: string) {
	try {
		return new URL(url).hostname || null;
	} catch {
		return null;
	}
}

function getCitedHostname(cite: string) {
	const [origin] = cite.trim().split(/\s+[›·]\s+/);
	if (!origin) return null;

	const hostname = getHostname(origin) ?? getHostname(`https://${origin}`);
	return hostname?.includes(".") ? hostname : null;
}

async function getGoogleRedirectHostname(href: string) {
	let redirectUrl: URL;
	try {
		redirectUrl = new URL(href, location.href);
	} catch {
		return null;
	}

	if (
		redirectUrl.origin !== location.origin ||
		!["/goto", "/url"].includes(redirectUrl.pathname)
	) {
		return null;
	}

	const parameterDomain = ["url", "q"]
		.map((parameter) => redirectUrl.searchParams.get(parameter))
		.map((url) => (url ? getHostname(url) : null))
		.find((hostname) => hostname !== null);
	if (parameterDomain) return parameterDomain;

	try {
		// Current Google variants encrypt outbound hrefs. The same-origin redirect
		// page still exposes the destination as a normal link.
		const response = await fetch(redirectUrl, { credentials: "include" });
		const responseDomain = getHostname(response.url);
		if (responseDomain && responseDomain !== location.hostname) {
			return responseDomain;
		}

		const redirectDocument = new DOMParser().parseFromString(
			await response.text(),
			"text/html",
		);
		const destination = redirectDocument
			.querySelector<HTMLAnchorElement>('a[href^="http"]')
			?.getAttribute("href");
		return destination ? getHostname(destination) : null;
	} catch (error) {
		console.warn(`${LOG_PREFIX} could not resolve Google redirect`, {
			href,
			error,
		});
		return null;
	}
}
