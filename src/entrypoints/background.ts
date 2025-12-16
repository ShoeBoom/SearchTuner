import { createResource, createRoot } from "solid-js";
import { browser, defineBackground } from "#imports";
import { getGoogleDomains } from "@/assets/googledomains";
import { isBangsActive } from "@/utils/storage";
import type { BangsData } from "../../pages/src/build_bangs";
import type { KagiBangsSchemaInput } from "../../pages/src/types";

const BANGS_URL = "https://shoeboom.github.io/SearchTuner/bangs.json";
const googleSearchPatterns = getGoogleDomains();

async function loadBangsData() {
	console.log("Loading bangs data");
	try {
		const res = await fetch(BANGS_URL);
		const data = (await res.json()) as BangsData;
		// bangsDataCache = data;
		return data;
	} catch (error) {
		console.error("Failed to fetch bangs data:", error);
		return null;
	}
}

// Parse bang from query - supports both "!w query" and "query !w" formats
function parseBang(
	query: string,
): { trigger: string; searchQuery: string } | null {
	const trimmed = query.trim();

	// Match bang at start: "!w query" or "!wiki query"
	const startMatch = trimmed.match(/^!(\S+)\s*(.*)/);
	if (startMatch) {
		return { trigger: startMatch[1], searchQuery: startMatch[2].trim() };
	}

	// Match bang at end: "query !w" or "query !wiki"
	const endMatch = trimmed.match(/^(.*?)\s+!(\S+)$/);
	if (endMatch) {
		return { trigger: endMatch[2], searchQuery: endMatch[1].trim() };
	}

	return null;
}

// Build the redirect URL from a bang and search query
function buildBangUrl(bang: KagiBangsSchemaInput[number], searchQuery: string) {
	let url = bang.u;
	let query = searchQuery;

	// Format flags: ALL enabled by default if fmt is not specified
	// If fmt is specified, only those flags are enabled (must be exhaustive)
	const allFlagsEnabled = bang.fmt === undefined;
	const hasFlag = (flag: string) =>
		allFlagsEnabled || (bang.fmt?.includes(flag as never) ?? false);

	// Handle regex substitution if present (before any encoding)
	if (bang.x) {
		return undefined;
	}

	// If no query provided and open_base_path is enabled, return base domain URL
	if (!query && hasFlag("open_base_path")) {
		return `https://${bang.d}/`;
	}

	// Apply URL encoding based on format flags
	if (hasFlag("url_encode_placeholder")) {
		if (hasFlag("url_encode_space_to_plus")) {
			// Encode spaces as + instead of %20
			query = encodeURIComponent(query).replace(/%20/g, "+");
		} else {
			// Standard URL encoding (spaces become %20)
			query = encodeURIComponent(query);
		}
	}
	// If url_encode_placeholder is disabled, don't encode at all

	// Replace the placeholder with the query
	url = url.replace("{{{s}}}", query);

	return url;
}

const addBangsListener = (props: {
	bangsData: () => BangsData | null;
	active: () => boolean;
}) => {
	return browser.webRequest.onBeforeRequest.addListener(
		(details): undefined => {
			if (props.active() === false) return;
			if (details.frameId !== 0) return;
			try {
				const bangsData = props.bangsData();
				if (!bangsData) return;

				const url = new URL(details.url);
				const query = url.searchParams.get("q");

				if (!query) return;

				const bangParsed = parseBang(query);
				if (!bangParsed) return;

				const { trigger, searchQuery } = bangParsed;
				const bangIndex = bangsData.triggerIndex[trigger.toLowerCase()];

				if (bangIndex === undefined) return;

				const bang = bangsData.bangs[bangIndex];
				if (!bang) return;

				const redirectUrl = buildBangUrl(bang, searchQuery);
				if (redirectUrl) {
					console.log(
						`[SearchTuner] Bang redirect: !${trigger} -> ${redirectUrl}`,
					);

					// Redirect the tab
					browser.tabs.update(details.tabId, { url: redirectUrl });
				}
			} catch (error) {
				console.error("[SearchTuner] Error processing bang:", error);
			}
		},
		{ urls: googleSearchPatterns, types: ["main_frame"] },
	);
};

export default defineBackground(() => {
	createRoot(() => {
		const active = () => isBangsActive() ?? false;
		const [bangsData] = createResource(active, async () => {
			return await loadBangsData();
		});
		addBangsListener({
			bangsData: () => bangsData() ?? null,
			active,
		});
	});
});
