import { renderTo } from "@/utils/render";
import { Route, HashRouter, A, useNavigate } from "@solidjs/router";
import logo from "@/assets/icon.png";
import { Settings, ArrowUpDown } from "lucide-solid";
import { RankingsTable } from "@/entrypoints/pages/rankingsTable";

function App() {
  return (
    <HashRouter
      root={(props) => (
        <div class="bg-background text-foreground min-h-screen w-screen min-w-[320px] p-4">
          <header class="justify-left flex items-center gap-4 p-4 text-xl *:hover:underline">
            <img src={logo} class="h-6 w-6" />
            <A href="/rankings" class="flex items-center gap-2">
              <ArrowUpDown />
              Rankings
            </A>
            <A href="/settings" class="flex items-center gap-2">
              <Settings />
              Settings
            </A>
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
      <Route path="/rankings" component={RankingsTable} />
    </HashRouter>
  );
}

renderTo(<App />);
