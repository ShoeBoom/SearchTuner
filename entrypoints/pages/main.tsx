import { renderToBody } from "@/utils/render";
import { Route, HashRouter } from "@solidjs/router";

function Home() {
  return <div>Home</div>;
}

function Rankings() {
  return <div>Rankings</div>;
}

function App() {
  return (
    <div class="bg-background text-foreground h-screen w-screen min-w-[320px] p-4">
      <HashRouter>
        <Route path="/" component={Home} />
        <Route path="/rankings" component={Rankings} />
      </HashRouter>
    </div>
  );
}

renderToBody(<App />);
