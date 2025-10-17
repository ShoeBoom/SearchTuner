import { type JSX } from "solid-js";
import {
  Ban,
  Shield,
  ShieldMinus,
  ShieldPlus,
  Pin,
  type LucideProps,
} from "lucide-solid";
import { RankingsV2, syncedRankings } from "@/utils/storage";

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

const setRank = (rank: RankingsV2[string], domain: string) => {
  void items.rankings.setValue({ ...syncedRankings(), [domain]: rank });
};

export const RankEditor = (props: {
  rank: RankingsV2[string];
  domain: string;
}) => {
  return (
    <div class="divide-foreground border-foreground flex w-max items-center divide-x-2 overflow-hidden rounded-full border-2">
      {Array.from(rankIcons.entries()).map(([value, opt]) => (
        <>
          <button
            class={`flex h-10 w-14 items-center justify-center ${props.rank.type === value ? `${opt.color.background} text-white` : ""}`}
            onClick={() =>
              setRank(
                { type: value, strength: props.rank.strength },
                props.domain,
              )
            }
          >
            <opt.icon size={18} />
          </button>
        </>
      ))}
    </div>
  );
};

const strengthMap = {
  weak: 0,
  normal: 1,
  strong: 2,
} as const;

const strengthKeys = Object.keys(strengthMap) as (keyof typeof strengthMap)[];

export const StrengthSlider = (props: {
  rank: RankingsV2[string];
  domain: string;
}) => {
  return (
    <div>
      <div class="flex w-full justify-between">
        <span>Weak</span>
        <span>Normal</span>
        <span>Strong</span>
      </div>
      <input
        disabled={props.rank.type !== "raise" && props.rank.type !== "lower"}
        class="w-full"
        type="range"
        min="0"
        max="2"
        value={strengthMap[props.rank.strength ?? "normal"]}
        onChange={(e) =>
          setRank(
            {
              type: props.rank.type,
              strength: strengthKeys[Number(e.target.value)],
            },
            props.domain,
          )
        }
      />
    </div>
  );
};
