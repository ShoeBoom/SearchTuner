import { For } from "solid-js";
import { items, RankingsV2, useRankings } from "@/utils/storage";
import { RankEditor } from "@/component/rank";
import { Trash2 } from "lucide-solid";

function RankingRow(props: { domain: string; rank: RankingsV2[string] }) {
  const deleteRank = () => {
    const newRankings = { ...useRankings() };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newRankings[props.domain];
    void items.rankings.setValue(newRankings);
  };
  return (
    <tr>
      <td class="text-center text-lg">{props.domain}</td>
      <td class="flex justify-center gap-5">
        <RankEditor rank={props.rank} domain={props.domain} />
        <button class="text-red-500" onClick={deleteRank}>
          <Trash2 />
        </button>
      </td>
    </tr>
  );
}

export function RankingsTable() {
  return (
    <div>
      <table class="w-full table-auto">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          <For each={Object.entries(useRankings() ?? {})}>
            {([domain, rank]) => <RankingRow domain={domain} rank={rank} />}
          </For>
        </tbody>
      </table>
    </div>
  );
}
