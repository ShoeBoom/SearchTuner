import { getSystemTheme } from "@/utils/theme";

function App() {
  const theme = getSystemTheme();
  return (
    <div
      data-theme={theme}
      class="bg-background text-foreground searchtuner-container h-full w-full min-w-[320px] p-4"
    >
      <div class="flex flex-row gap-2">
        <a href={browser.runtime.getURL("/pages.html")} target="_blank">
          Rankings
        </a>
      </div>
    </div>
  );
}

export default App;
