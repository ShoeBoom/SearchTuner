import googledomains from "@/assets/googledomains";
import type { BangsData } from "../../pages/src/build_bangs";
import type { KagiBangsSchemaInput } from "../../pages/src/types";

const BANGS_URL = "https://shoeboom.github.io/SearchTuner/bangs.json";
// WXT storage uses the key without prefix (local:/sync: just indicates storage area)
const CACHE_KEY = "bangs_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

type BangsCacheData = { value: BangsData; timestamp: number };

// In-memory cache for synchronous access in webRequest handler
let bangsDataCache: BangsData | null = null;

async function loadBangsData(): Promise<BangsData | null> {
	try {
		const cached = await browser.storage.local.get(CACHE_KEY);
		const cacheData = cached[CACHE_KEY] as BangsCacheData | undefined;

		if (cacheData && Date.now() - cacheData.timestamp < CACHE_DURATION) {
			bangsDataCache = cacheData.value;
			return cacheData.value;
		}

		const res = await fetch(BANGS_URL);
		const data = (await res.json()) as BangsData;
		await browser.storage.local.set({
			[CACHE_KEY]: { value: data, timestamp: Date.now() },
		});
		bangsDataCache = data;
		return data;
	} catch (error) {
		console.error("Failed to fetch bangs data:", error);
		// Try to return cached data even if expired
		const cached = await browser.storage.local.get(CACHE_KEY);
		const cacheData = cached[CACHE_KEY] as BangsCacheData | undefined;
		if (cacheData) {
			bangsDataCache = cacheData.value;
		}
		return cacheData?.value ?? null;
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
function buildBangUrl(
	bang: KagiBangsSchemaInput[number],
	searchQuery: string,
): string {
	let url = bang.u;
	let query = searchQuery;

	// Format flags: ALL enabled by default if fmt is not specified
	// If fmt is specified, only those flags are enabled (must be exhaustive)
	const allFlagsEnabled = bang.fmt === undefined;
	const hasFlag = (flag: string) =>
		allFlagsEnabled || (bang.fmt?.includes(flag as never) ?? false);

	// Handle regex substitution if present (before any encoding)
	if (bang.x) {
		try {
			const regex = new RegExp(bang.x);
			const match = query.match(regex);
			if (match) {
				// Replace $1, $2, etc. with captured groups
				url = url.replace(
					/\$(\d+)/g,
					(_, n) => match[Number.parseInt(n, 10)] ?? "",
				);
				// If regex matched, we've handled the query
				return url;
			}
		} catch {
			// Invalid regex, continue with normal substitution
		}
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

function isGoogleSearchUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return (
			googledomains.some((domain) =>
				parsed.hostname.endsWith(domain.slice(1)),
			) && parsed.pathname === "/search"
		);
	} catch {
		return false;
	}
}

export default defineBackground(() => {
	// Pre-fetch bangs data on startup for synchronous access
	void loadBangsData();

	// Use webNavigation API (works in both MV2 and MV3)
	browser.webNavigation.onBeforeNavigate.addListener(async (details) => {
		const bangsActive = await items.bangs_active.getValue();
		if (!bangsActive) return;
		// Only handle top-level navigation
		if (details.frameId !== 0) return;

		try {
			if (!isGoogleSearchUrl(details.url)) return;
			if (!bangsDataCache) {
				// Try to load data if not cached yet
				await loadBangsData();
				if (!bangsDataCache) return;
			}

			const url = new URL(details.url);
			const query = url.searchParams.get("q");

			if (!query) return;

			const bangParsed = parseBang(query);
			if (!bangParsed) return;

			const { trigger, searchQuery } = bangParsed;
			const bangIndex = bangsDataCache.triggerIndex[trigger.toLowerCase()];

			if (bangIndex === undefined) return;

			const bang = bangsDataCache.bangs[bangIndex];
			if (!bang) return;

			const redirectUrl = buildBangUrl(bang, searchQuery);
			console.log(`[SearchTuner] Bang redirect: !${trigger} -> ${redirectUrl}`);

			// Redirect the tab
			await browser.tabs.update(details.tabId, { url: redirectUrl });
		} catch (error) {
			console.error("[SearchTuner] Error processing bang:", error);
		}
	});
});
