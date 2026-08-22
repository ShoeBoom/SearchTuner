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
	const searches = extractDomains()
		.map((s) => {
			if (s.isErr() || s.value.elementType !== "result") {
				return null;
			}
			return s.value;
		})
		.filter((s) => s !== null);
	return searches;
}

export type Results = ReturnType<typeof getResults>;

function extractDomains() {
	// Get the main results container
	const $rso = $("div#rso");
	if ($rso.length === 0) {
		console.error("Could not find result container #rso");
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

	const href = element.find(selectors.url).first().attr("href");
	const domain = href ? getHostname(href) : null;

	if (!domain) {
		return err({
			error: "could_not_parse_domain" as const,
			element,
		});
	}

	return ok({
		domain,
		text: element.find(selectors.title).first().text(),
		elementType: "result" as const,
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
