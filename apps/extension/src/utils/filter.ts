import $ from "jquery";
import { err, ok } from "neverthrow";

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

export function getResults() {
	return extractDomains()
		.map((s) => {
			return s.isOk() ? s.value : null;
		})
		.filter((s) => s !== null);
}

export type Results = ReturnType<typeof getResults>;

function extractDomains() {
	// Get the main results container
	const $rso = $("div#rso");
	if ($rso.length === 0) {
		return [];
	}

	const blocks = $rso
		.find(RESULT_ROOT_SELECTOR)
		.map((_, element) => $(element))
		.toArray();

	const results = blocks.map(parseBlock);

	return results;
}

function parseBlock(element: JQuery) {
	const selectors = RESULT_SELECTORS.find(({ root }) => element.is(root));
	if (!selectors) {
		return err({
			error: "could_not_parse_domain" as const,
			element,
		});
	}

	const link = element
		.find(selectors.url)
		.filter((_, link) => link.closest(RESULT_ROOT_SELECTOR) === element[0])
		.first();
	const href = link.attr("href");
	const hrefDomain = href ? getHostname(href) : null;
	const cite = link.find("cite").first().text();
	const citeDomain =
		selectors.type === "result" ? getCitedHostname(cite) : null;
	const domain = hrefDomain ?? citeDomain;

	if (!domain) {
		return err({
			error: "could_not_parse_domain" as const,
			element,
		});
	}

	return ok({
		domain,
		domainSource: hrefDomain ? ("href" as const) : ("cite" as const),
		text: element.find(selectors.title).first().text(),
		// Rich result cards are safe to block individually, but moving them would
		// pull them out of their containing news, image, or video module.
		canReorder:
			selectors.type === "result" &&
			element.parents(RESULT_ROOT_SELECTOR).length === 0,
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
