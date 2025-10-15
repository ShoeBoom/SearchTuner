import { getSystemTheme } from "@/utils/theme";
import { renderToBody } from "@/utils/render";

function App() {
  const theme = getSystemTheme();

  return (
    <div
      data-theme={theme}
      class="bg-background text-foreground searchtuner-container h-full w-full min-w-[320px] p-4"
    ></div>
  );
}

renderToBody(<App />);
