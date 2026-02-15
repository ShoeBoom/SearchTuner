import type { BangsData } from "@searchtuner/bangs/types";
import { browser, defineBackground } from "#imports";
import { getGoogleDomains } from "@/assets/googledomains";
import { type BangAliases, getBang, items, observeItem } from "@/utils/storage";

const googleSearchPatterns = getGoogleDomains();

// Parse bang from query - supports "!w query", "query !w", and quick bangs at start/end
function parseBang(
	query: string,
	// bangsData: BangsData,
	quickBangs: string[] = [],
	aliases: BangAliases = {},
) {
	const trimmed = query.trim();

	// Regular !bang syntax: matches !trigger anywhere in query
	const bangMatches = Array.from(
		trimmed.matchAll(/(?<=^|\s)!(\S+)(?=\s|$)/g),
	).map((match) => ({ trigger: match[1].toLowerCase(), match: match[0] }));

	const validBang = bangMatches.find(
		({ trigger }) => getBang(trigger, aliases) !== null,
	);
	if (validBang) {
		const bang = getBang(validBang.trigger, aliases);
		if (bang) {
			return {
				trigger: validBang.trigger,
				match: validBang.match,
				data: bang,
				searchQuery: trimmed.replace(validBang.match, " ").trim(),
			};
		}
	}

	// Quick bangs: check first and last word
	const words = trimmed.split(/\s+/);
	const firstWord = words[0];
	const lastWord = words.length > 1 ? words[words.length - 1] : undefined;

	// Check first word
	if (firstWord) {
		const lowerFirst = firstWord.toLowerCase();
		if (quickBangs.some((qb) => qb.toLowerCase() === lowerFirst)) {
			const bang = getBang(lowerFirst, aliases);
			if (bang) {
				return {
					trigger: lowerFirst,
					match: firstWord,
					data: bang,
					searchQuery: words.slice(1).join(" "),
				};
			}
		}
	}

	// Check last word
	if (lastWord) {
		const lowerLast = lastWord.toLowerCase();
		if (quickBangs.some((qb) => qb.toLowerCase() === lowerLast)) {
			const bang = getBang(lowerLast, aliases);
			if (bang) {
				return {
					trigger: lowerLast,
					match: lastWord,
					data: bang,
					searchQuery: words.slice(0, -1).join(" "),
				};
			}
		}
	}

	return null;
}

// Build the redirect URL from a bang and search query
function buildBangUrl(bang: BangsData["bangs"][number], searchQuery: string) {
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
	quickBangs: () => string[];
	aliases: () => BangAliases;
	active: () => boolean;
}) => {
	return browser.webRequest.onBeforeRequest.addListener(
		(details): undefined => {
			if (props.active() === false) return;
			if (details.frameId !== 0) return;
			try {
				const url = new URL(details.url);
				const query = url.searchParams.get("q");

				if (!query) return;

				const quickBangs = props.quickBangs();
				const aliases = props.aliases();
				const bang = parseBang(query, quickBangs, aliases);
				if (!bang) return;

				const redirectUrl = buildBangUrl(bang.data, bang.searchQuery);
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
	const activeObserver = observeItem(items.bangs_active, false);
	const quickBangsObserver = observeItem(items.quick_bangs, [] as string[]);
	const aliasesObserver = observeItem(items.bang_aliases, {} as BangAliases);

	addBangsListener({
		quickBangs: quickBangsObserver.get,
		aliases: aliasesObserver.get,
		active: activeObserver.get,
	});
});
