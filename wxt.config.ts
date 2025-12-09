import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
// import googledomains from "./src/assets/googledomains";

// const getGoogleDomainPatterns = () =>
// 	googledomains.map((domain) => `*://*${domain}/*`);

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-solid", "@wxt-dev/auto-icons"],
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
		permissions: ["storage", "webNavigation"],
		// host_permissions: getGoogleDomainPatterns(),
	},
});
