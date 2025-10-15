import { getSystemTheme } from "@/utils/theme";

function App() {
  const theme = getSystemTheme();

  return (
    <div
      data-theme={theme}
      class="tw:bg-background tw:w-full tw:p-4 tw:h-full tw:text-foreground tw:min-w-[320px] searchtuner-container"
    ></div>
  );
}

export default App;
