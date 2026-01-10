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

const start = /^\/search\?q=/;
const templatePart = /\{\{\{s\}\}\}/;
const filterPart = /(site|inurl|filetype)(%3A|:).*/;
const joinPart = /\+/;
const end = /$/;
const first = `${filterPart.source}${joinPart.source}${templatePart.source}`;
const second = `${templatePart.source}${joinPart.source}${filterPart.source}`;

const regex = new RegExp(`${start.source}(${first}|${second})${end.source}`);

const noRelativeNonSearchUrls = createChecker((bang) => {
	if (bang.url.startsWith("/")) {
		const match = regex.exec(bang.url);
		if (!match) {
			throw new Error(
				`Bang ${JSON.stringify(bang, null, 2)} is not a valid relative search URL`,
			);
		}
	}
});

const checkers = [noRegex, noNonKagiRelativeUrl, noRelativeNonSearchUrls];

export const checkBangsMapper = (bang: KagiBangsSchema[number]) => {
	checkers.map((checker) => checker(bang));
	return bang;
};
