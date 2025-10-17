import { For } from "solid-js";
import { items, RankingsV2, syncedRankings } from "@/utils/storage";
import { RankEditor, StrengthSlider } from "@/component/rank";
import { Trash2 } from "lucide-solid";

function RankingRow(props: { domain: string; rank: RankingsV2[string] }) {
  const deleteRank = () => {
    const newRankings = { ...syncedRankings() };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newRankings[props.domain];
    void items.rankings.setValue(newRankings);
  };
  return (
    <tr class="hover:bg-foreground/10 [&>td]:py-2">
      <td class="text-center text-lg">{props.domain}</td>
      <td>
        <div class="flex justify-center">
          <RankEditor
            class="flex-none"
            rank={props.rank}
            domain={props.domain}
          />
        </div>
      </td>

      <td>
        <div class="flex justify-center">
          <StrengthSlider
            class="flex-1"
            rank={props.rank}
            domain={props.domain}
          />
        </div>
      </td>
      <td>
        <div class="flex justify-center">
          <button class="text-red-500" onClick={deleteRank}>
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function RankingsTable() {
  return (
    <div>
      <table class="w-full max-w-4xl table-auto">
        <thead class="border-b">
          <tr>
            <th class="pb-2 text-sm font-semibold">Domain</th>
            <th class="pb-2 text-sm font-semibold">Rank</th>
            <th class="pb-2 text-sm font-semibold">Strength</th>
            <th class="pb-2 text-sm font-semibold">Delete</th>
          </tr>
        </thead>
        <tbody>
          <For each={Object.entries(syncedRankings() ?? {})}>
            {([domain, rank]) => <RankingRow domain={domain} rank={rank} />}
          </For>
        </tbody>
      </table>
    </div>
  );
}
