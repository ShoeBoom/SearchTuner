import $ from "jquery";
import { err, ok } from "neverthrow";

// for refrence see https://github.com/benbusby/whoogle-search/blob/e4cabe3e5b9aa55cc14f845bb3e194d83d46ed1c/app/filter.py
// https://github.com/searxng/searxng/blob/885d02c8c3a3ae54177eab81e672abe65a76acf5/searx/engines/google.py

const ITEM_PINNED_RESULT_CLASS = "BYM4Nd";
const JSCONTROLLER_RESULT = "SC7lYd";

const JSNAME_LINK_ID = "UWckNb";

// const BLOCK_TITLES: string[] = [
//   "People also ask",
//   "Related searches",
//   "Videos",
//   "Top stories",
//   "Images",
//   "News",
// ];

// Extend jQuery with custom methods
// declare global {
//   interface JQuery {
//     log(): JQuery;
//   }
// }

// // Add the log method to jQuery
// $.fn.log = function (this: JQuery<HTMLElement>) {
//   // Convert jQuery object to array and spread it for console.log
//   console.log.apply(console, this as any);
//   return this;
// };

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

  // Filter out unwanted sections
  const blocks = $rso
    .find(
      `[jscontroller="${JSCONTROLLER_RESULT}"], .${ITEM_PINNED_RESULT_CLASS}`,
    )
    .map((_, element) => $(element))
    .toArray();

  const results = blocks.map(parseBlock);

  return results;
}

function parseBlock(element: JQuery) {
  const href = element
    .find("a")
    .filter(`[jsname="${JSNAME_LINK_ID}"]`)
    .map((_, element) => ({
      href: $(element).attr("href"),
      text: $(element).find("h3").text(),
    }))
    .get();

  const isResult = element.is(`[jscontroller="${JSCONTROLLER_RESULT}"]`);
  const isPinnedResult = element.is(`.${ITEM_PINNED_RESULT_CLASS}`);

  if (isResult || isPinnedResult) {
    if (href[0]?.href === undefined) {
      return err({
        error: "could_not_parse_domain" as const,
        element,
      });
    }
    return ok({
      domain: getHostnames(href[0].href),
      text: href[0].text,
      elementType: "result" as const,
      element,
    });
  } else if (href.length === 0) {
    return ok({
      elementType: "empty" as const,
      element,
    });
  } else {
    return ok({
      elementType: "special" as const,
      element,
    });
  }
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
