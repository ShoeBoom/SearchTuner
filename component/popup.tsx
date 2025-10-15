import "@/assets/searchtuner.css";
import "@/assets/tailwind.css";
import { type JSX, Show } from "solid-js";
import { useSettings, items } from "@/utils/storage";
import { createSignal, createEffect, onCleanup, createMemo } from "solid-js";
import {
  Ban,
  Shield,
  ShieldMinus,
  ShieldPlus,
  Pin,
  type LucideProps,
} from "lucide-solid";

export function usePopup() {
  const [isOpen, setIsOpen] = createSignal(false);
  let el: HTMLElement | undefined;
  createEffect(() => {
    if (!isOpen()) return;
    const handler = (e: MouseEvent) => {
      if (el && !el.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    onCleanup(() => document.removeEventListener("mousedown", handler));
  });
  const toggle = () => setIsOpen((p) => !p);
  const setContainerRef = (ref: HTMLElement) => {
    el = ref;
  };
  return { isOpen, toggle, setContainerRef };
}

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

function RankIcon(props: { rank: 2 | 1 | 0 | -1 | -2 }) {
  const icon = () => {
    const opt = rankIcons.get(props.rank);
    return opt?.icon({ size: 18, class: opt.color.text });
  };
  return <>{icon()}</>;
}

const rankings = useSettings(items.rankings);

function Popup(props: Results[number]) {
  const { isOpen, toggle, setContainerRef } = usePopup();
  const rank = createMemo(() => rankings()?.[props.domain] ?? 0);
  const setRank = (rank: 2 | 1 | 0 | -1 | -2) => {
    void items.rankings.setValue({ ...rankings(), [props.domain]: rank });
  };
  return (
    <div class="relative inline-block" ref={setContainerRef}>
      <button class="flex items-center justify-center" onClick={toggle}>
        <RankIcon rank={rank()} />
      </button>
      <Show when={isOpen()}>
        <div class="bg-background text-foreground border-foreground absolute top-0 left-full w-64 rounded-md border-2 p-3">
          <div class="flex flex-col gap-2">
            <div>Domain: {props.domain}</div>
            <div>Text: {props.text}</div>
            <div class="divide-foreground border-foreground flex items-center divide-x-2 overflow-hidden rounded-full border-2">
              {Array.from(rankIcons.entries()).map(([value, opt]) => (
                <>
                  <button
                    class={`flex h-10 w-14 items-center justify-center ${rank() === value ? `${opt.color.background} text-white` : ""}`}
                    onClick={() => setRank(value)}
                  >
                    <opt.icon size={18} />
                  </button>
                </>
              ))}
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default Popup;
