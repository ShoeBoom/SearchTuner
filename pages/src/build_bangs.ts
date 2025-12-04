import fs from "node:fs";
import { checkBangsMapper } from "./checker";
import { schema } from "./types";

const link =
	"https://raw.githubusercontent.com/kagisearch/bangs/refs/heads/main/data/bangs.json";

const content = schema.parse(await fetch(link).then((res) => res.json()));

const IGNORE_T: ReadonlySet<string> = new Set([
	"html",
	"epoch",
	"diff",
	// Kagi specific triggers that need to be converted to Google equivalents
	"tr",
	"translate",
	"ktr",
	// these params are not supported by google search
	"safeon",
	"safeoff",
]);

const bangs = content
	.filter(
		(bang) =>
			!IGNORE_T.has(bang.trigger) &&
			!bang.triggers?.some((v) => IGNORE_T.has(v)),
	)
	.map(checkBangsMapper)
	.map((bang) => {
		if (bang.url.startsWith("/search?q=") && bang.domain === "kagi.com") {
			return {
				...bang,
				site: bang.site.replace("Kagi", "Google"),
				domain: "google.com",
				url: `https://google.com${bang.url}`,
			};
		}
		if (!bang.url.startsWith("http"))
			throw Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);

		// return as is
		return bang;
	});

const triggerIndex = new Map<string, number>();
bangs.forEach((bang, index) => {
	// if (triggerIndex.has(bang.trigger)) {
	// 	throw new Error(`Trigger ${bang.trigger} is already defined`);
	// }
	triggerIndex.set(bang.trigger, index);
	bang.triggers?.forEach((trigger) => {
		// if (triggerIndex.has(trigger)) {
		// 	throw new Error(`Trigger ${trigger} is already defined`);
		// }
		triggerIndex.set(trigger, index);
	});
});

fs.writeFileSync(
	"public/bangs.json",
	JSON.stringify({
		bangs: schema.encode(bangs),
		triggerIndex: Object.fromEntries(triggerIndex.entries()),
	}),
);
