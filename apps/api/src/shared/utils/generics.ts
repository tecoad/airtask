export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type Mutable<T> = {
	-readonly [k in keyof T]: T[k];
};
