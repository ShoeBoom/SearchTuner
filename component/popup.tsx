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

const rankings = useSettings(items.rankings);

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
        background: "tw:bg-red-500",
        text: "tw:text-foreground",
      },
    },
  ],
  [
    -1,
    {
      icon: ShieldMinus,
      color: {
        background: "tw:bg-yellow-500",
        text: "tw:text-foreground",
      },
    },
  ],
  [
    0,
    {
      icon: Shield,
      color: {
        background: "tw:bg-stone-500",
        text: "tw:text-foreground",
      },
    },
  ],
  [
    1,
    {
      icon: ShieldPlus,
      color: {
        background: "tw:bg-green-500",
        text: "tw:text-green-500",
      },
    },
  ],
  [
    2,
    {
      icon: Pin,
      color: {
        background: "tw:bg-blue-500",
        text: "tw:text-blue-500",
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

function Popup(props: Results[number]) {
  const { isOpen, toggle, setContainerRef } = usePopup();
  const rank = createMemo(() => rankings()?.[props.domain] ?? 0);
  const setRank = (rank: 2 | 1 | 0 | -1 | -2) => {
    void items.rankings.setValue({ ...rankings(), [props.domain]: rank });
  };
  return (
    <div class="tw:relative tw:inline-block" ref={setContainerRef}>
      <button
        class="tw:flex tw:items-center tw:justify-center"
        onClick={toggle}
      >
        <RankIcon rank={rank()} />
      </button>
      <Show when={isOpen()}>
        <div class="tw:absolute tw:left-full tw:top-0 tw:w-64 tw:rounded-md tw:p-3 tw:bg-background tw:text-foreground tw:border-foreground tw:border-2">
          <div class="tw:gap-2 tw:flex tw:flex-col">
            <div>Domain: {props.domain}</div>
            <div>Text: {props.text}</div>
            <div class="tw:flex tw:items-center tw:rounded-full tw:divide-x-2 tw:divide-foreground tw:overflow-hidden tw:border-2 tw:border-foreground">
              {Array.from(rankIcons.entries()).map(([value, opt]) => (
                <>
                  <button
                    class={`tw:w-14 tw:h-10 tw:flex tw:items-center tw:justify-center ${rank() === value ? `${opt.color.background} tw:text-white` : ""}`}
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
