import { getSystemTheme } from "@/utils/theme";

function App() {
  const theme = getSystemTheme();
  return (
    <div
      data-theme={theme}
      class="tw:bg-background tw:w-full tw:p-4 tw:h-full tw:text-foreground tw:min-w-[320px] searchtuner-container"
    >
      <div class="tw:flex tw:flex-row tw:gap-2">
        <a href={browser.runtime.getURL("/pages.html")} target="_blank">
          Rankings
        </a>
      </div>
    </div>
  );
}

export default App;
