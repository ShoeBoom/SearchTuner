// const rankings = useSettings(items.rankings);

function App() {
  // const ranksEntries = createMemo(() => Object.entries(rankings() ?? {}));

  return (
    <div class="tw:bg-background tw:p-4 tw:text-foreground tw:min-w-[320px] searchtuner-container">
      <div class="tw:flex tw:flex-row tw:gap-2">
        <div>Rankings</div>
      </div>
    </div>
  );
}

export default App;
