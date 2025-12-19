import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import { getGoogleDomains } from "./src/assets/googledomains";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-solid", "@wxt-dev/auto-icons"],
	imports: false,
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	srcDir: "src",
	webExt: {
		startUrls: ["https://www.google.com/search?q=!w+apple"],
		openDevtools: true,
		chromiumArgs: [
			"--auto-open-devtools-for-tabs", // https://developer.chrome.com/docs/devtools/open#auto
		],
	},
	manifest: {
		permissions: ["storage", "webRequest"],
		host_permissions: getGoogleDomains(),
	},
});
