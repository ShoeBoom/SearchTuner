// save the bangs to the filesystem

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { data as BANGS_DATA } from "@searchtuner/bangs/lib/build_bangs";

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bangsJsonPath = join(__dirname, "..", "public", "bangs.json");

export const saveBangs = async () => {
	const bangsJson = JSON.stringify(BANGS_DATA);

	await writeFile(bangsJsonPath, bangsJson);
};

void saveBangs();
