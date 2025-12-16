export const createAtom = <T>(init: T) => {
	let value = init;
	return [
		() => value,
		(newValue: T) => {
			value = newValue;
		},
	] as const;
};
