import $ from "jquery";
import { err, ok } from "neverthrow";

// Keep these in sync with uBlacklist's desktop Google web selectors.
// https://github.com/ublacklist/builtin/blob/master/serpinfo/google.yml
const RESULT_SELECTORS = [
	{
		root: ".vt6azd:not(.g-blk), .Ww4FFb",
		url: ":is(.yuRUbf, .xe8e1b) a",
		title: "h3",
	},
	{ root: ".vCUuC", url: "a", title: ".Yt787" },
	{ root: ".sHEJob", url: 'a[href^="http"]', title: ".OSrXXb" },
	{
		root: "[data-news-cluster-id]",
		url: "a",
		title: '[role="heading"][aria-level="3"]',
	},
	{ root: ".eejeod", url: "a", title: "h3" },
	{
		root: ".ivg-i:not(.my5z3d)",
		url: ".EZAeBe",
		title: ".OSrXXb",
	},
	{ root: ".ivg-i.my5z3d", url: ".LBcIee", title: ".ddBkwd" },
] as const;

const RESULT_ROOT_SELECTOR = RESULT_SELECTORS.map(({ root }) => root).join(
	", ",
);

const REORDERABLE_RESULT_SELECTOR = '[jscontroller="SC7lYd"], .BYM4Nd';

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
	const href = selectors
		? element.find(selectors.url).first().attr("href")
		: undefined;

	if (!selectors || href === undefined) {
		return err({
			error: "could_not_parse_domain" as const,
			element,
		});
	}

	return ok({
		domain: getHostnames(href),
		text: element.find(selectors.title).first().text(),
		elementType: "result" as const,
		// Rich result cards are safe to block individually, but moving them would
		// pull them out of their containing news, image, or video module.
		canReorder:
			element.is(REORDERABLE_RESULT_SELECTOR) &&
			element.parents(REORDERABLE_RESULT_SELECTOR).length === 0,
		element,
	});
}

function getHostnames(url: string) {
	try {
		if (url.startsWith("/") || url.startsWith("#")) {
			throw new Error("Invalid URL");
		}
		return new URL(url).hostname;
	} catch {
		throw new Error("Invalid URL");
	}
}
