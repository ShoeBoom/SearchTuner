import "@/assets/tailwind.css";
import {
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	Show,
} from "solid-js";
import { RankEditor, RankIcon, StrengthSlider } from "@/component/rank";
import type { Results } from "@/utils/filter";
import { syncedRankings } from "@/utils/storage";

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
					<div class="absolute top-0 left-full w-64 rounded-md border-2 border-foreground bg-background p-3 text-foreground">
						<div class="flex flex-col gap-2">
							<div>Domain: {props.domain}</div>
							<div>Text: {props.text}</div>
							<RankEditor rank={rank()} domain={props.domain} />
							<StrengthSlider rank={rank()} domain={props.domain} />
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
}

export default Popup;
