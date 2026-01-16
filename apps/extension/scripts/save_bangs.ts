// save the bangs to the filesystem

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { data as BANGS_DATA } from "@searchtuner/bangs/lib/build_bangs";

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bangsTsPath = join(__dirname, "..", "public", "bangs.ts");

export const saveBangs = async () => {
	const tsContent = `// Auto-generated file - do not edit manually
import type { BangsData } from "@searchtuner/bangs/lib/build_bangs";

export const data: BangsData = ${JSON.stringify(BANGS_DATA, null, "\t")} as const;
`;

	await writeFile(bangsTsPath, tsContent);
};

void saveBangs();
console.log("Bangs saved to", bangsTsPath);
