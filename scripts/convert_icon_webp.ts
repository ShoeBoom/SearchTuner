import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPng = join(__dirname, "..", "src", "assets", "icon.png");
const outputWebp = join(__dirname, "..", "src", "assets", "icon.webp");

if (!existsSync(inputPng)) {
	console.error(`Input file not found: ${inputPng}`);
	process.exit(1);
}
async function convertPngToWebp(input: string, output: string) {
	try {
		await sharp(input).webp({ quality: 70 }).toFile(output);
		console.log(`Converted ${input} to ${output}`);
	} catch (err: unknown) {
		console.error("Conversion failed:", err);
		process.exit(1);
	}
}

await convertPngToWebp(inputPng, outputWebp);
