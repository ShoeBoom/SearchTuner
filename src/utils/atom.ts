export const createAtom = <T>(init: T) => {
	let value = init;
	const callbacks = [] as ((newValue: T, oldValue: T) => void)[];
	return [
		() => value,
		(newValue: T) => {
			const oldValue = value;
			value = newValue;
			callbacks.forEach((callback) => void callback(newValue, oldValue));
		},
		(callback: (newValue: T, oldValue: T) => void) => {
			callbacks.push(callback);
		},
	] as const;
};
