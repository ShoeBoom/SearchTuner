import { For } from "solid-js";

const rankings = useSettings(items.rankings);

function App() {
  const ranksEntries = createMemo(() => Object.entries(rankings() ?? {}));

  return (
    <div class="tw:bg-gray-50 tw:p-4 tw:text-gray-900">
      <div class="tw:flex tw:flex-col tw:gap-2">
        <For each={ranksEntries()}>
          {([domain, rank]) => (
            <div class="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:rounded-lg tw:border tw:border-gray-200 tw:bg-white tw:px-3 tw:py-2 tw:shadow-sm">
              <span class="tw:truncate tw:text-sm tw:font-medium">
                {domain}
              </span>
              <span class="tw:rounded-md tw:bg-blue-50 tw:px-2 tw:py-0.5 tw:text-xs tw:font-semibold tw:text-blue-700">
                {rank}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default App;
