import { renderToBody } from "@/utils/render";
import { For } from "solid-js";
import { Route, HashRouter, A, useNavigate } from "@solidjs/router";
import { items, useSettings } from "@/utils/storage";

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
    <HashRouter
      root={(props) => (
        <div class="bg-background text-foreground min-h-screen w-screen min-w-[320px] p-4">
          <header class="justify-left flex items-center gap-4 p-4 text-xl *:hover:underline">
            <A href="/settings">Settings</A>
            <A href="/rankings">Rankings</A>
          </header>
          {props.children}
        </div>
      )}
    >
      <Route
        path="/"
        component={() => {
          const navigate = useNavigate();

          navigate("/rankings", { replace: true });
          return <></>;
        }}
      />
      <Route path="/settings" component={() => <div>Settings</div>} />
      <Route path="/rankings" component={Rankings} />
    </HashRouter>
  );
}

renderToBody(<App />);
