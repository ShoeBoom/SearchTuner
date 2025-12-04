import type { KagiBangsSchema } from "./types";

const createChecker = (fn: (bang: KagiBangsSchema[number]) => void) => {
	return fn;
};

const noRegex = createChecker((bang) => {
	if (bang.regex) {
		throw new Error(`found bang with regex: ${JSON.stringify(bang, null, 2)}`);
	}
});

const noNonKagiRelativeUrl = createChecker((bang) => {
	if (bang.url.startsWith("/") && bang.domain !== "kagi.com") {
		throw new Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);
	}
});

const noRelativeNonSearchUrl = createChecker((bang) => {
	if (bang.url.startsWith("/")) {
		const regex1 = /^\/search\?q=site:.*\+\{\{\{s\}\}\}$/;
		const regex2 = /^\/search\?q=\{\{\{s\}\}\}\+site:.*$/;
		const regex = new RegExp(`${regex1.source}|${regex2.source}`);
		const match = regex.exec(bang.url);
		if (!match) {
			throw new Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);
		}
	}
});

const checkers = [noRegex, noNonKagiRelativeUrl, noRelativeNonSearchUrl];

export const checkBangsMapper = (bang: KagiBangsSchema[number]) => {
	checkers.map((checker) => checker(bang));
	return bang;
};
