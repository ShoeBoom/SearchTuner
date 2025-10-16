import { For } from "solid-js";
import { items, useSettings } from "@/utils/storage";
import { RankEditor } from "@/component/rank";
import { Trash2 } from "lucide-solid";

const rankings = useSettings(items.rankings);
function RankingRow(props: { domain: string; rank: 2 | 1 | 0 | -1 | -2 }) {
  const setRank = (rank: 2 | 1 | 0 | -1 | -2) => {
    void items.rankings.setValue({ ...rankings(), [props.domain]: rank });
  };
  const deleteRank = () => {
    const newRankings = { ...rankings() };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newRankings[props.domain];
    void items.rankings.setValue(newRankings);
  };
  return (
    <div class="flex items-center gap-2">
      <div class="text-lg">{props.domain}</div>
      <RankEditor rank={props.rank} setRank={setRank} />
      <button class="text-red-500" onClick={deleteRank}>
        <Trash2 />
      </button>
    </div>
  );
}

export function RankingsTable() {
  return (
    <div>
      <For each={Object.entries(rankings() ?? {})}>
        {([domain, rank]) => <RankingRow domain={domain} rank={rank} />}
      </For>
    </div>
  );
}
