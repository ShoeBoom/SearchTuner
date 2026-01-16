import { ArrowRight, X } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import { BANGS_DATA } from "@/utils/bangs";
import { bangAliasesData, items, quickBangsData } from "@/utils/storage";

const QuickBangsManager = () => {
	const [inputValue, setInputValue] = createSignal("");
	const quickBangs = () => quickBangsData() ?? [];

	const addQuickBang = async () => {
		const triggerToAdd = inputValue().trim().toLowerCase();
		if (!triggerToAdd) return;

		if (quickBangs().includes(triggerToAdd)) return;

		const newQuickBangs = [...quickBangs(), triggerToAdd];
		await items.quick_bangs.setValue(newQuickBangs);
		setInputValue("");
	};

	const removeQuickBang = async (trigger: string) => {
		const newQuickBangs = quickBangs().filter((t) => t !== trigger);
		await items.quick_bangs.setValue(newQuickBangs);
	};

	return (
		<div class="mb-6 rounded-lg border border-foreground/20 p-4">
			<h3 class="mb-2 font-semibold text-lg">Quick Bangs</h3>
			<p class="mb-4 text-foreground/70 text-sm">
				Quick bangs can be triggered without the "!" prefix when placed at the
				start or end of your search query.
			</p>

			<div class="mb-4 flex gap-2">
				<input
					type="text"
					value={inputValue()}
					onInput={(e) => {
						setInputValue(e.currentTarget.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") void addQuickBang();
					}}
					placeholder="Enter bang trigger (e.g., w, g, ddg)"
					class="flex-1 rounded border border-foreground/30 bg-transparent px-3 py-2 text-sm focus:border-foreground/50 focus:outline-none"
				/>
				<button
					onClick={() => void addQuickBang()}
					class="rounded bg-foreground/10 px-4 py-2 font-medium text-sm hover:bg-foreground/20"
				>
					Add
				</button>
			</div>

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

const BangAliasesManager = () => {
	const [aliasInput, setAliasInput] = createSignal("");
	const [targetInput, setTargetInput] = createSignal("");
	const [error, setError] = createSignal<string | null>(null);
	const aliases = () => bangAliasesData() ?? {};

	const addAlias = async (targetTrigger?: string) => {
		const alias = aliasInput().trim().toLowerCase();
		const target = targetTrigger ?? targetInput().trim().toLowerCase();

		if (!alias) {
			setError("Please enter an alias");
			return;
		}
		if (!target) {
			setError("Please enter a target bang trigger");
			return;
		}

		// Validate that the target trigger exists
		const bang =
			BANGS_DATA.triggerIndex[target as keyof typeof BANGS_DATA.triggerIndex];
		if (bang === undefined) {
			setError(`"${target}" is not a valid bang trigger`);
			return;
		}

		// Check if alias already exists
		if (aliases()[alias]) {
			setError(`Alias "${alias}" already exists`);
			return;
		}

		// Add the alias
		const newAliases = { ...aliases(), [alias]: target };
		await items.bang_aliases.setValue(newAliases);
		setAliasInput("");
		setTargetInput("");
		setError(null);
	};

	const removeAlias = async (alias: string) => {
		const newAliases = { ...aliases() };
		delete newAliases[alias];
		await items.bang_aliases.setValue(newAliases);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			void addAlias();
		}
	};

	// Check if alias conflicts with existing bang
	const getConflictInfo = (alias: string) => {
		const existingBang =
			BANGS_DATA.triggerIndex[alias as keyof typeof BANGS_DATA.triggerIndex];
		if (existingBang !== undefined) {
			return BANGS_DATA.bangs[existingBang];
		}
		return null;
	};

	return (
		<div class="mb-6 rounded-lg border border-foreground/20 p-4">
			<h3 class="mb-2 font-semibold text-lg">Bang Aliases</h3>
			<p class="mb-4 text-foreground/70 text-sm">
				Create custom aliases for existing bang triggers. Aliases take priority
				over built-in bangs (e.g., alias "y" to "yt" to use YouTube instead of
				Yahoo).
			</p>

			<div class="relative mb-4 flex gap-2">
				<input
					type="text"
					value={aliasInput()}
					onInput={(e) => {
						setAliasInput(e.currentTarget.value);
						setError(null);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") void addAlias();
					}}
					placeholder="Alias (e.g., y)"
					class="w-32 rounded border border-foreground/30 bg-transparent px-3 py-2 text-sm focus:border-foreground/50 focus:outline-none"
				/>
				<span class="flex items-center text-foreground/50">
					<ArrowRight size={16} />
				</span>
				<div class="relative flex-1">
					<input
						type="text"
						value={targetInput()}
						onInput={(e) => {
							setTargetInput(e.currentTarget.value);
							setError(null);
						}}
						onKeyDown={handleKeyDown}
						placeholder="Target bang (e.g., yt)"
						list="bang-target-triggers"
						class="w-full rounded border border-foreground/30 bg-transparent px-3 py-2 text-sm focus:border-foreground/50 focus:outline-none"
					/>
					<datalist id="bang-target-triggers">
						<For each={Object.keys(BANGS_DATA.triggerIndex)}>
							{(trigger) => <option value={trigger} />}
						</For>
					</datalist>
				</div>
				<button
					onClick={() => void addAlias()}
					class="rounded bg-foreground/10 px-4 py-2 font-medium text-sm hover:bg-foreground/20"
				>
					Add
				</button>
			</div>

			<Show when={error()}>
				<p class="mb-4 text-red-500 text-sm">{error()}</p>
			</Show>

			<Show
				when={Object.keys(aliases()).length > 0}
				fallback={
					<p class="text-foreground/50 text-sm">No bang aliases configured</p>
				}
			>
				<div class="flex flex-wrap gap-2">
					<For each={Object.entries(aliases()) as [string, string][]}>
						{([alias, target]) => {
							const conflict = getConflictInfo(alias);
							const bangIndex =
								BANGS_DATA.triggerIndex[
									target as keyof typeof BANGS_DATA.triggerIndex
								];
							const bang =
								bangIndex === undefined ? null : BANGS_DATA.bangs[bangIndex];
							return (
								<span class="inline-flex items-center gap-1 rounded bg-foreground/10 px-3 py-1 text-sm">
									<span class="font-medium">{alias}</span>
									<ArrowRight size={12} class="text-foreground/50" />
									<span>{target}</span>
									<Show when={bang}>
										<span class="text-foreground/60">({bang?.s})</span>
									</Show>
									<Show when={conflict}>
										<span
											class="ml-1 text-yellow-500"
											title={`Overrides ${conflict?.s}`}
										>
											*
										</span>
									</Show>
									<button
										onClick={() => void removeAlias(alias)}
										class="ml-1 rounded-full p-0.5 hover:bg-foreground/20"
									>
										<X size={14} />
									</button>
								</span>
							);
						}}
					</For>
				</div>
			</Show>
		</div>
	);
};

const Bangs = () => {
	return (
		<div>
			<QuickBangsManager />
			<BangAliasesManager />

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
					<For each={BANGS_DATA.bangs}>
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
