import type { BangsData } from "@searchtuner/bangs/lib/build_bangs";
import type { KagiBangsSchemaInput } from "@searchtuner/bangs/lib/types";
import { regex } from "arkregex";
import { createResource, createRoot } from "solid-js";
import { browser, defineBackground } from "#imports";
import { getGoogleDomains } from "@/assets/googledomains";
import { getBang, isBangsActive, items, quickBangsData } from "@/utils/storage";

const BANGS_URL = "https://search.shoeboom.dev/bangs.json";
const googleSearchPatterns = getGoogleDomains();

async function loadBangsData() {
	console.log("Loading bangs data");
	const cached = await items.bangs_data.getValue();
	if (cached) return cached.data;
	const res = await fetch(BANGS_URL);
	const data = (await res.json()) as BangsData;
	await items.bangs_data.setValue({ data });
	return data;
}

// Parse bang from query - supports "!w query", "query !w", and quick bangs at start/end
function parseBang(
	query: string,
	bangsData: BangsData,
	quickBangs: string[] = [],
) {
	const trimmed = query.trim();

	// Regular !bang syntax: matches !trigger anywhere in query
	const bangMatches = Array.from(
		trimmed.matchAll(/(?<=^|\s)!(\S+)(?=\s|$)/g),
	).map((match) => ({ trigger: match[1].toLowerCase(), match: match[0] }));

	const validBang = bangMatches.find(
		({ trigger }) => getBang(trigger, bangsData) !== null,
	);
	if (validBang) {
		const bang = getBang(validBang.trigger, bangsData);
		if (bang) {
			return {
				trigger: validBang.trigger,
				match: validBang.match,
				data: bang,
			};
		}
	}

	// Quick bangs: match trigger at start (^trigger\s) or end (\s+trigger$)
	if (quickBangs.length > 0) {
		const quickBangPattern = regex(
			`(?:^(${quickBangs.join("|")})(?=\\s|$))|(?:(?<=^|\\s)(${quickBangs.join("|")})$)`,
			"i",
		);
		const quickMatch = quickBangPattern.exec(trimmed);
		if (quickMatch) {
			const trigger = (quickMatch[1] ?? quickMatch[2])?.toLowerCase();
			if (trigger) {
				const bang = getBang(trigger, bangsData);
				if (bang) {
					return {
						trigger,
						match: quickMatch[0],
						data: bang,
					};
				}
			}
		}
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
	quickBangs: () => string[];
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

				const quickBangs = props.quickBangs();
				const bang = parseBang(query, bangsData, quickBangs);
				if (!bang) return;

				// Remove the matched trigger from the query
				const searchQuery = query.replace(bang.match, " ").trim();

				const redirectUrl = buildBangUrl(bang.data, searchQuery);
				if (redirectUrl) {
					console.log(
						`[SearchTuner] Bang redirect: ${bang.match} -> ${redirectUrl}`,
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
			quickBangs: () => quickBangsData() ?? [],
			active,
		});
	});
});
