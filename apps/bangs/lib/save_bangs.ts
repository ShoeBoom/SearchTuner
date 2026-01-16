// save the bangs to the extension's public folder

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { data as BANGS_DATA } from "./build_bangs";

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output path is relative to this file's location in the monorepo
const bangsTsPath = join(
	__dirname,
	"..",
	"..",
	"extension",
	"src",
	"utils",
	"bangs.ts",
);
const bangsJsonPath = join(
	__dirname,
	"..",
	"..",
	"site",
	"public",
	"bangs.json",
);

const JsonData = JSON.stringify(BANGS_DATA);

export const saveBangs = async () => {
	const tsContent = `// Auto-generated file - do not edit manually
  import type { BangsData } from "@searchtuner/bangs/types";

export const BANGS_DATA: BangsData = ${JsonData} as const;
`;

	await writeFile(bangsTsPath, tsContent);
	await writeFile(bangsJsonPath, JsonData);
	console.log("Bangs saved to", bangsTsPath);
};

void saveBangs();
