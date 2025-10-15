import { renderToBody } from "@/utils/render";
import { For } from "solid-js";
import { Route, HashRouter } from "@solidjs/router";
import { items, useSettings } from "@/utils/storage";

function Home() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
const rankings = useSettings(items.rankings);
function Rankings() {
  return (
    <div>
      <For each={Object.entries(rankings() ?? {})}>
        {([domain, rank]) => (
          <div>
            {domain}: {rank}
          </div>
        )}
      </For>
    </div>
  );
}

function App() {
  return (
    <div class="bg-background text-foreground min-h-screen w-screen min-w-[320px] p-4">
      <header class="flex items-center justify-center gap-4 p-4 text-xl shadow-md">
        <a href="/rankings">Rankings</a>
        <a href="/">Home</a>
      </header>
      <HashRouter>
        <Route path="/" component={Home} />
        <Route path="/rankings" component={Rankings} />
      </HashRouter>
    </div>
  );
}

renderToBody(<App />);
