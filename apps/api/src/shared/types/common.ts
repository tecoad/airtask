export type Serialized<T> = {
	[K in keyof T]: T[K] extends object ? Serialized<T[K]> : string | number;
};
