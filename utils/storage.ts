import { storage } from "#imports";
import { createSignal, onMount, onCleanup } from "solid-js";

type RankingsV1 = { [domain: string]: 2 | 1 | 0 | -1 | -2 };

export type RankingsV2 = Record<
  string,
  {
    type: "raise" | "lower" | "block" | "none" | "pin";
    strength?: "weak" | "normal" | "strong" | undefined;
  }
>;

const rankings = storage.defineItem<RankingsV2>("sync:rankings", {
  fallback: {},
  version: 2,
  migrations: {
    2: (rankings: RankingsV1): RankingsV2 => {
      const convertRank = (rank: RankingsV1[string]) => {
        const mapper = {
          [-2]: "block",
          [-1]: "lower",
          [0]: "none",
          [1]: "raise",
          [2]: "pin",
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

export const items = { rankings };

type StorageItem<T, F extends Record<string, unknown> = {}> = ReturnType<
  typeof storage.defineItem<T, F>
>;

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

export const useRankings = useSettings(items.rankings);
