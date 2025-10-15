import { renderToBody } from "@/utils/render";

function App() {
  return (
    <div class="bg-background text-foreground flex h-full w-full min-w-[320px] flex-row gap-2 p-4">
      <a
        href={browser.runtime.getURL("/pages.html") + "#/rankings"}
        target="_blank"
      >
        Rankings
      </a>
    </div>
  );
}

renderToBody(<App />);
