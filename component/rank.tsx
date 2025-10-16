import { type JSX } from "solid-js";
import {
  Ban,
  Shield,
  ShieldMinus,
  ShieldPlus,
  Pin,
  type LucideProps,
} from "lucide-solid";

const rankIcons: ReadonlyMap<
  -2 | -1 | 0 | 1 | 2,
  {
    icon: (props: LucideProps) => JSX.Element;
    color: { background: string; text: string };
  }
> = new Map([
  [
    -2,
    {
      icon: Ban,
      color: {
        background: "bg-red-500",
        text: "text-foreground",
      },
    },
  ],
  [
    -1,
    {
      icon: ShieldMinus,
      color: {
        background: "bg-yellow-500",
        text: "text-foreground",
      },
    },
  ],
  [
    0,
    {
      icon: Shield,
      color: {
        background: "bg-stone-500",
        text: "text-foreground",
      },
    },
  ],
  [
    1,
    {
      icon: ShieldPlus,
      color: {
        background: "bg-green-500",
        text: "text-green-500",
      },
    },
  ],
  [
    2,
    {
      icon: Pin,
      color: {
        background: "bg-blue-500",
        text: "text-blue-500",
      },
    },
  ],
]);

export function RankIcon(props: { rank: 2 | 1 | 0 | -1 | -2 }) {
  const icon = () => {
    const opt = rankIcons.get(props.rank);
    return opt?.icon({ size: 18, class: opt.color.text });
  };
  return <>{icon()}</>;
}

export const RankEditor = (props: {
  rank: 2 | 1 | 0 | -1 | -2;
  setRank: (rank: 2 | 1 | 0 | -1 | -2) => void;
}) => {
  return (
    <div class="divide-foreground border-foreground flex items-center divide-x-2 overflow-hidden rounded-full border-2">
      {Array.from(rankIcons.entries()).map(([value, opt]) => (
        <>
          <button
            class={`flex h-10 w-14 items-center justify-center ${props.rank === value ? `${opt.color.background} text-white` : ""}`}
            onClick={() => props.setRank(value)}
          >
            <opt.icon size={18} />
          </button>
        </>
      ))}
    </div>
  );
};
