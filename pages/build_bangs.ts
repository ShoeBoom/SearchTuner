import fs from "node:fs";
import type { KagiBangsSchema } from "./types";

const link =
	"https://raw.githubusercontent.com/kagisearch/bangs/refs/heads/main/data/bangs.json";

const content = (await fetch(link).then((res) =>
	res.json(),
)) as KagiBangsSchema;

const IGNORE_T: ReadonlySet<string> = new Set(["html", "epoch", "diff"]);

const bangs = content
	.filter((bang) => !IGNORE_T.has(bang.t))
	.map((bang) => {
		if (bang.u.startsWith("/") && bang.d !== "kagi.com") {
			throw new Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);
		}

		if (bang.u.startsWith("/")) {
			if (!bang.u.startsWith("/search?q=")) {
				throw new Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);
			}
			return {
				...bang,
			};
		}
		if (!bang.u.startsWith("http"))
			throw Error(`Bang ${JSON.stringify(bang, null, 2)} is not valid`);

		// return as is
		return bang;
	});

fs.writeFileSync("public/bangs.json", JSON.stringify(bangs));
