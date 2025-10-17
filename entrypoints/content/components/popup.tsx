import "@/assets/tailwind.css";
import {
  Show,
  createSignal,
  createEffect,
  onCleanup,
  createMemo,
} from "solid-js";
import { syncedRankings } from "@/utils/storage";
import { RankEditor, RankIcon, StrengthSlider } from "@/component/rank";

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

function Popup(props: Results[number]) {
  const { isOpen, toggle, setContainerRef } = usePopup();

  const rank = createMemo(
    () =>
      syncedRankings()?.[props.domain] ?? {
        type: "none" as const,
      },
  );

  return (
    <div>
      <div class="absolute top-0 left-full z-[127]" ref={setContainerRef}>
        <button class="flex items-center justify-center" onClick={toggle}>
          <RankIcon rank={rank()} />
        </button>
        <Show when={isOpen()}>
          <div class="bg-background text-foreground border-foreground absolute top-0 left-full w-64 rounded-md border-2 p-3">
            <div class="flex flex-col gap-2">
              <div>Domain: {props.domain}</div>
              <div>Text: {props.text}</div>
              <div class="flex justify-center">
                <RankEditor rank={rank()} domain={props.domain} />
              </div>

              <StrengthSlider rank={rank()} domain={props.domain} />
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default Popup;
