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
	"tr",
	"translate",
	"ktr",
]);

const bangs = content
	.filter(
		(bang) =>
			!IGNORE_T.has(bang.trigger) &&
			!bang.triggers?.some((v) => IGNORE_T.has(v)),
	)
	.map(checkBangsMapper)
	.map((bang) => {
		if (bang.url.startsWith("/")) {
			if (!bang.url.startsWith("/search?q=")) {
				throw new Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);
			}
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

fs.writeFileSync(
	"public/bangs.json",
	JSON.stringify(schema.encode(bangs), null, 2),
);
