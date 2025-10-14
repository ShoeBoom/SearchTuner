import { For } from "solid-js";

const rankings = useSettings(items.rankings);

function App() {
  const ranksEntries = createMemo(() => Object.entries(rankings() ?? {}));

  return (
    <div>
      <For each={ranksEntries()}>
        {([domain, rank]) => (
          <div>
            {domain}: {rank}
          </div>
        )}
      </For>
    </div>
  );
}

export default App;
