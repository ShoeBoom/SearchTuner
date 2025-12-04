import clsx from "clsx";
import { ArrowUpDown, Hash, Info, Settings } from "lucide-solid";
import type { JSX } from "solid-js";
import logo from "@/assets/icon.webp";
import { isRankingsActive, items } from "@/utils/storage";

const basePagesUrl = `${browser.runtime.getURL("/pages.html")}#`;
const Button = (props: {
	path: string;
	icon: JSX.Element;
	text: string;
	hoverColor: `group-hover:${string}`;
}) => (
	<a
		href={basePagesUrl + props.path}
		target="_blank"
		class="group flex items-center gap-3 rounded-lg hover:underline"
	>
		<div
			class={`rounded-md bg-foreground/10 p-1.5 transition-colors ${props.hoverColor} group-hover:text-white`}
		>
			{props.icon}
		</div>
		<span class="text-sm">{props.text}</span>
	</a>
);

const Switch = (props: {
	checked: boolean;
	onChange: () => void;
	title?: string;
}) => (
	<button
		class={clsx(
			"relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
			props.checked
				? "bg-green-500 focus:ring-green-500"
				: "bg-gray-300 focus:ring-gray-500",
		)}
		onClick={props.onChange}
		title={props.title}
	>
		<span
			class={clsx(
				"inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
				props.checked ? "translate-x-6" : "translate-x-1",
			)}
		></span>
	</button>
);

function App() {
	const toggleActive = async () => {
		await items.rankings_active.setValue(
			!(await items.rankings_active.getValue()),
		);
	};

	return (
		<div class="flex h-full w-full min-w-[320px] flex-col gap-4 p-4">
			<div class="flex items-center gap-3">
				<img src={logo} alt="SearchTuner" class="h-10 w-10 rounded-lg" />
				<div class="flex flex-col">
					<h1 class="font-semibold text-lg">SearchTuner</h1>
					<p class="text-foreground/60 text-xs">
						Customize your search results
					</p>
				</div>
			</div>

			<div class="flex flex-col gap-2 px-4">
				<div
					class={clsx(
						"flex items-center justify-between gap-3 transition-opacity",
						!isRankingsActive() ? "opacity-50" : "",
					)}
				>
					<Button
						path="/rankings"
						icon={<ArrowUpDown size={18} />}
						text="View Rankings"
						hoverColor="group-hover:bg-red-500"
					/>
					<Switch
						checked={isRankingsActive() ?? true}
						onChange={toggleActive}
						title={
							(isRankingsActive() ?? true)
								? "Disable SearchTuner"
								: "Enable SearchTuner"
						}
					/>
				</div>
				<div class="pointer-events-none opacity-50">
					<Button
						path="/settings"
						icon={<Hash size={18} />}
						text="Bangs (coming soon)"
						hoverColor="group-hover:bg-yellow-500"
					/>
				</div>

				<Button
					path="/settings"
					icon={<Settings size={18} />}
					text="Settings"
					hoverColor="group-hover:bg-green-600"
				/>

				<Button
					path="/about"
					icon={<Info size={18} />}
					text="About"
					hoverColor="group-hover:bg-blue-500"
				/>
			</div>
		</div>
	);
}

render(() => <App />, document.body);
