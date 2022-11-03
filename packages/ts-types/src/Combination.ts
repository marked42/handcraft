type Keys = Combination<["foo", "bar", "baz"]>;

type Combination<
    T extends string[],
    U = T[number],
    I = U
> = I extends infer S extends string
    ? S | `${S} ${Combination<T, Exclude<U, I>>}`
    : never;
