import { getSystemTheme } from "@/utils/theme";

function App() {
  const theme = getSystemTheme();

  return (
    <div
      data-theme={theme}
      class="tw:bg-background tw:w-screen tw:p-4 tw:h-screen tw:text-foreground tw:min-w-[320px] searchtuner-container"
    >
      <div class="tw:flex tw:flex-row tw:gap-2">
        <div>Rankings</div>
      </div>
    </div>
  );
}

export default App;
