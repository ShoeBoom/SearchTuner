import { getSystemTheme } from "@/utils/theme";
import { renderToBody } from "@/utils/render";

function App() {
  const theme = getSystemTheme();
  return (
    <div data-theme={theme} class="searchtuner-container">
      <div class="bg-background text-foreground flex h-full w-full min-w-[320px] flex-row gap-2 p-4">
        <a href={browser.runtime.getURL("/pages.html")} target="_blank">
          Rankings
        </a>
      </div>
    </div>
  );
}

export default App;

renderToBody(<App />);
