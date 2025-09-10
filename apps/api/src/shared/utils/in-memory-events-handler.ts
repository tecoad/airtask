export class InMemoryEventsHandler<D extends Record<string, any>> {
	private listeners = {} as Record<keyof D, ((data: any) => void)[]>;
	subscribe = <T extends keyof D>(eventName: T, listener: (data: D[T]) => void) => {
		// if (!eventEmitter.listeners[eventName]) {
		// 	eventEmitter.listeners[eventName] = [];
		// }
		// eventEmitter.listeners[eventName].push(listener);
		// return () => {
		// 	eventEmitter.listeners[eventName] = eventEmitter.listeners[eventName].filter(
		// 		(l) => l !== listener,
		// 	);
		// };
		this.listeners[eventName] = this.listeners[eventName] || [];
		this.listeners[eventName].push(listener);
		return () => {
			this.listeners[eventName] = this.listeners[eventName].filter((l) => l !== listener);
		};
	};
	emit = <T extends keyof D>(eventName: T, data: D[T]) => {
		if (this.listeners[eventName]) {
			this.listeners[eventName].forEach((listener) => {
				listener(data);
			});
		}
	};
}
