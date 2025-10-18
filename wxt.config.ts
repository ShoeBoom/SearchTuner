import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-solid", "@wxt-dev/auto-icons"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  srcDir: "src",
  runner: {
    startUrls: ["https://www.google.com/search?q=apple"],
    openDevtools: true,
    chromiumArgs: [
      "--auto-open-devtools-for-tabs", // https://developer.chrome.com/docs/devtools/open#auto
    ],
  },
  manifest: {
    permissions: ["storage"],
  },
});
