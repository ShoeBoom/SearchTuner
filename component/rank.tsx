import { type JSX } from "solid-js";
import {
  Ban,
  Shield,
  ShieldMinus,
  ShieldPlus,
  Pin,
  type LucideProps,
} from "lucide-solid";
import { RankingsV2, useRankings } from "@/utils/storage";

const rankIcons: ReadonlyMap<
  RankingsV2[string]["type"],
  {
    icon: (props: LucideProps) => JSX.Element;
    color: { background: string; text: string };
  }
> = new Map([
  [
    "block",
    {
      icon: Ban,
      color: {
        background: "bg-red-500",
        text: "text-foreground",
      },
    },
  ],
  [
    "lower",
    {
      icon: ShieldMinus,
      color: {
        background: "bg-yellow-500",
        text: "text-foreground",
      },
    },
  ],
  [
    "none",
    {
      icon: Shield,
      color: {
        background: "bg-stone-500",
        text: "text-foreground",
      },
    },
  ],
  [
    "raise",
    {
      icon: ShieldPlus,
      color: {
        background: "bg-green-500",
        text: "text-green-500",
      },
    },
  ],
  [
    "pin",
    {
      icon: Pin,
      color: {
        background: "bg-blue-500",
        text: "text-blue-500",
      },
    },
  ],
]);

export function RankIcon(props: { rank: RankingsV2[string] }) {
  const icon = () => {
    const opt = rankIcons.get(props.rank.type);
    return opt?.icon({ size: 18, class: opt.color.text });
  };
  return <>{icon()}</>;
}

export const RankEditor = (props: {
  rank: RankingsV2[string];
  domain: string;
}) => {
  const setRank = (rank: RankingsV2[string]) => {
    void items.rankings.setValue({ ...useRankings(), [props.domain]: rank });
  };
  return (
    <div class="divide-foreground border-foreground flex items-center divide-x-2 overflow-hidden rounded-full border-2">
      {Array.from(rankIcons.entries()).map(([value, opt]) => (
        <>
          <button
            class={`flex h-10 w-14 items-center justify-center ${props.rank.type === value ? `${opt.color.background} text-white` : ""}`}
            onClick={() =>
              setRank({ type: value, strength: props.rank.strength })
            }
          >
            <opt.icon size={18} />
          </button>
        </>
      ))}
    </div>
  );
};
