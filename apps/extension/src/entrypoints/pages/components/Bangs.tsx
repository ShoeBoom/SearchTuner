import { X } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { bangsData, getBang, items, quickBangsData } from "@/utils/storage";

const QuickBangsManager = () => {
	const [inputValue, setInputValue] = createSignal("");
	const [error, setError] = createSignal<string | null>(null);
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [showSuggestions, setShowSuggestions] = createSignal(false);
	const quickBangs = () => quickBangsData() ?? [];
	const bangsList = () => bangsData()?.data ?? null;

	const suggestions = createMemo(() => {
		const query = inputValue().trim().toLowerCase();
		if (!query) return [];

		const data = bangsList();
		if (!data) return [];

		const triggers = Object.keys(data.triggerIndex);
		const matches = triggers
			.filter((t) => t.startsWith(query) && !quickBangs().includes(t))
			.sort((a, b) => a.length - b.length)
			.slice(0, 5);

		return matches;
	});

	const addQuickBang = async (trigger?: string) => {
		const triggerToAdd = trigger ?? inputValue().trim().toLowerCase();
		if (!triggerToAdd) return;

		const data = bangsList();
		if (!data) {
			setError("Bangs data not loaded yet");
			return;
		}

		// Validate that the trigger exists in bangsData
		const bang = getBang(triggerToAdd, data);
		if (!bang) {
			setError(`"${triggerToAdd}" is not a valid bang trigger`);
			return;
		}

		// Check if already added
		if (quickBangs().includes(triggerToAdd)) {
			setError(`"${triggerToAdd}" is already a quick bang`);
			return;
		}

		// Add to quick bangs
		const newQuickBangs = [...quickBangs(), triggerToAdd];
		await items.quick_bangs.setValue(newQuickBangs);
		setInputValue("");
		setError(null);
		setShowSuggestions(false);
		setSelectedIndex(0);
	};

	const removeQuickBang = async (trigger: string) => {
		const newQuickBangs = quickBangs().filter((t) => t !== trigger);
		await items.quick_bangs.setValue(newQuickBangs);
	};

	const selectSuggestion = (trigger: string) => {
		void addQuickBang(trigger);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		const suggs = suggestions();
		if (suggs.length > 0 && showSuggestions()) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => Math.min(i + 1, suggs.length - 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => Math.max(i - 1, 0));
			} else if (e.key === "Enter") {
				e.preventDefault();
				void addQuickBang(suggs[selectedIndex()]);
			} else if (e.key === "Escape") {
				setShowSuggestions(false);
			}
		} else if (e.key === "Enter") {
			void addQuickBang();
		}
	};

	return (
		<div class="mb-6 rounded-lg border border-foreground/20 p-4">
			<h3 class="mb-2 font-semibold text-lg">Quick Bangs</h3>
			<p class="mb-4 text-foreground/70 text-sm">
				Quick bangs can be triggered without the "!" prefix when placed at the
				start or end of your search query.
			</p>

			<div class="relative mb-4 flex gap-2">
				<div class="relative flex-1">
					<input
						type="text"
						value={inputValue()}
						onInput={(e) => {
							setInputValue(e.currentTarget.value);
							setError(null);
							setShowSuggestions(true);
							setSelectedIndex(0);
						}}
						onKeyDown={handleKeyDown}
						onFocus={() => setShowSuggestions(true)}
						onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
						placeholder="Enter bang trigger (e.g., w, g, ddg)"
						class="w-full rounded border border-foreground/30 bg-transparent px-3 py-2 text-sm focus:border-foreground/50 focus:outline-none"
					/>
					<Show when={showSuggestions() && suggestions().length > 0}>
						<ul class="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded border border-foreground/30 bg-background shadow-lg">
							<For each={suggestions()}>
								{(trigger, index) => {
									const bang = () => {
										const data = bangsList();
										return data ? getBang(trigger, data) : null;
									};
									return (
										<li
											class={`cursor-pointer px-3 py-2 text-sm ${
												index() === selectedIndex()
													? "bg-foreground/20"
													: "hover:bg-foreground/10"
											}`}
											onMouseDown={() => selectSuggestion(trigger)}
											onMouseEnter={() => setSelectedIndex(index())}
										>
											<span class="font-medium">{trigger}</span>
											<Show when={bang()}>
												<span class="ml-2 text-foreground/60">{bang()?.s}</span>
											</Show>
										</li>
									);
								}}
							</For>
						</ul>
					</Show>
				</div>
				<button
					onClick={() => void addQuickBang()}
					class="rounded bg-foreground/10 px-4 py-2 font-medium text-sm hover:bg-foreground/20"
				>
					Add
				</button>
			</div>

			<Show when={error()}>
				<p class="mb-4 text-red-500 text-sm">{error()}</p>
			</Show>

			<Show
				when={quickBangs().length > 0}
				fallback={
					<p class="text-foreground/50 text-sm">No quick bangs configured</p>
				}
			>
				<div class="flex flex-wrap gap-2">
					<For each={quickBangs()}>
						{(trigger) => (
							<span class="inline-flex items-center gap-1 rounded bg-foreground/10 px-3 py-1 text-sm">
								{trigger}
								<button
									onClick={() => void removeQuickBang(trigger)}
									class="ml-1 rounded-full p-0.5 hover:bg-foreground/20"
								>
									<X size={14} />
								</button>
							</span>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
};

const Bangs = () => {
	const bangs = () => bangsData()?.data?.bangs ?? [];

	return (
		<div>
			<QuickBangsManager />

			<table class="w-full table-fixed">
				<colgroup>
					<col style={{ width: "25%" }} />
					<col style={{ width: "25%" }} />
					<col style={{ width: "25%" }} />
					<col style={{ width: "25%" }} />
				</colgroup>
				<thead class="border-b">
					<tr>
						<th class="pb-2 font-semibold text-sm">Site</th>
						<th class="pb-2 font-semibold text-sm">Trigger</th>
						<th class="pb-2 font-semibold text-sm">Domain</th>
						<th class="pb-2 font-semibold text-sm">Category</th>
					</tr>
				</thead>
				<tbody>
					<For each={bangs()}>
						{(bang) => {
							const allTriggers = [bang.t, ...(bang.ts ?? [])];
							return (
								<tr
									class="hover:bg-foreground/10 [&>td]:py-2"
									style={{ "content-visibility": "auto" }}
								>
									<td class="text-center">{bang.s}</td>
									<td class="text-center">{allTriggers.join(", ")}</td>
									<td class="text-center">{bang.d}</td>
									<td class="text-center">{bang.c ?? "-"}</td>
								</tr>
							);
						}}
					</For>
				</tbody>
			</table>
		</div>
	);
};

export default Bangs;
