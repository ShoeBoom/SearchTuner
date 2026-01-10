import { data as BANGS_DATA } from "@searchtuner/bangs/lib/build_bangs";
import { createSignal, onCleanup, onMount } from "solid-js";
import { storage } from "#imports";

type RankingsV1 = { [domain: string]: 2 | 1 | 0 | -1 | -2 };

export type RankingsV2 = Record<
	string,
	{
		type: "raise" | "lower" | "block" | "none" | "pin";
		strength?: "weak" | "normal" | "strong" | undefined;
	}
>;

const rankings = storage.defineItem<RankingsV2>("sync:rankings", {
	init: () => ({}),
	version: 2,
	migrations: {
		2: (rankings: RankingsV1): RankingsV2 => {
			const convertRank = (rank: RankingsV1[string]) => {
				const mapper = {
					[-2]: "block",
					[-1]: "lower",
					0: "none",
					1: "raise",
					2: "pin",
				} as const;
				return { type: mapper[rank] };
			};
			return Object.fromEntries(
				Object.entries(rankings).map(([domain, rank]) => [
					domain,
					convertRank(rank),
				]),
			);
		},
	},
});

// this will set the version of the storage item. it is only run after all migrations are run.
// https://github.com/wxt-dev/wxt/issues/1775
void rankings.setMeta({ v: 2 });

const rankings_active = storage.defineItem<boolean>("local:rankings_active", {
	init: () => true,
	fallback: true,
	version: 1,
});

void rankings_active.setMeta({ v: 1 });

const bangs_active = storage.defineItem<boolean>("local:bangs_active", {
	fallback: false,
	version: 1,
});

void bangs_active.setMeta({ v: 1 });

const quick_bangs = storage.defineItem<string[]>("sync:quick_bangs", {
	init: () => [],
	fallback: [],
	version: 1,
});

void quick_bangs.setMeta({ v: 1 });

export const items = {
	rankings,
	rankings_active,
	bangs_active,
	quick_bangs,
};

type StorageItem<
	T,
	F extends Record<string, unknown> = Record<string, never>,
> = ReturnType<typeof storage.defineItem<T, F>>;

const useSettings = <T>(itemDef: StorageItem<T>) => {
	const [value, setValue] = createSignal<T | null>(null);
	onMount(async () => {
		const value = await itemDef.getValue();
		setValue(() => value);
	});

	const unwatch = itemDef.watch((newVal) => {
		setValue(() => newVal);
	});
	onCleanup(() => unwatch());

	return value;
};

export const syncedRankings = useSettings(items.rankings);
export const isRankingsActive = useSettings(items.rankings_active);
export const isBangsActive = useSettings(items.bangs_active);
// export const bangsData = useSettings(items.bangs_data);
export const quickBangsData = useSettings(items.quick_bangs);

export const getBang = (trigger: string) => {
	const index = BANGS_DATA.triggerIndex[trigger];
	if (index === undefined) return null;
	return BANGS_DATA.bangs[index];
};
