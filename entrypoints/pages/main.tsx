import { renderToBody } from "@/utils/render";

function App() {
  return (
    <div class="bg-background text-foreground h-full w-full min-w-[320px] p-4"></div>
  );
}

renderToBody(<App />);
