import { getResults, type Results } from "@/utils/filter";
import $ from "jquery";
import { render } from "solid-js/web";
import Popup from "@/component/popup";
import { items } from "@/utils/storage";
import googledomains from "@/assets/googledomains";

const RERANK_WEIGHT = 3;

function isPageDark() {
  const cs = getComputedStyle(document.body);
  const scheme = cs.getPropertyValue("background-color");
  if (scheme && scheme === "rgb(32, 33, 36)") return true;
  if (scheme && scheme === "rgb(255, 255, 255)") return false;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return true;
  return false;
}

async function orderedResults(results: Results) {
  const rankings = await items.rankings.getValue();
  const totalResults = results.length;

  return results.map((result, index) => {
    const rank = rankings[result.domain] ?? 0;
    const order = totalResults - index;

    switch (rank) {
      case 2:
        return { ...result, ord: order + 9999, rank };
      case 1:
        return { ...result, ord: order + RERANK_WEIGHT, rank };
      case 0:
        return { ...result, ord: order, rank };
      case -1:
        return { ...result, ord: order - RERANK_WEIGHT, rank };
      case -2:
        // result.element.remove();
        // return null;
        return { ...result, ord: order - 9999, rank };
    }
  });
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

async function sortResults(results: Results) {
  const rankedResults = await orderedResults(results);
  reorderResults(rankedResults);
}

function addPopupContainers(searches: Results) {
  const isDark = isPageDark();
  searches.forEach((search) => {
    const container = document.createElement("div");
    container.className = "searchtuner-popup-container";
    container.setAttribute("data-theme", isDark ? "dark" : "light");

    // Ensure the parent is positioned relatively so absolute works
    const parent = search.element[0];
    if (getComputedStyle(parent).position === "static") {
      parent.style.position = "relative";
    }

    parent.appendChild(container);
    render(() => <Popup {...search} />, container);
  });
}

async function script() {
  const searches = getResults();
  const resultsPromise = sortResults(searches);
  addPopupContainers(searches);
  await resultsPromise;
}
const getGoogleDomains = () => {
  return googledomains.map((domain) => `*://*${domain}/search*`);
};

export default defineContentScript({
  matches: getGoogleDomains(),
  runAt: "document_start",
  main() {
    const style = document.createElement("style");
    style.id = "searchtuner-hide-main";
    style.textContent = "#main{display:none !important;}";
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (document.head || document.documentElement).appendChild(style);
    document.addEventListener("DOMContentLoaded", () => {
      // Use MutationObserver to detect when div#rso becomes available
      const observer = new MutationObserver((mutations, obs) => {
        if ($("div#rso").length) {
          void script().finally(() => {
            const hideStyle = document.getElementById("searchtuner-hide-main");
            if (hideStyle) hideStyle.remove();
          });
          obs.disconnect(); // Stop observing once element is found
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  },
});
