import { storage } from "#imports";
import { createSignal, onMount, onCleanup } from "solid-js";

const rankings = storage.defineItem<{ [domain: string]: 2 | 1 | 0 | -1 | -2 }>(
  "sync:rankings",
  {
    fallback: {},
    version: 1,
  },
);

export const items = { rankings };

type StorageItem<T, F extends Record<string, unknown> = {}> = ReturnType<
  typeof storage.defineItem<T, F>
>;

export const useSettings = <T>(itemDef: StorageItem<T>) => {
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
