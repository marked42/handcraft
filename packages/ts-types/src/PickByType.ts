type PickByType<T, U> = Pick<T, GetTypeKeys<T, U>>;

type GetTypeKeys<T, U, P = keyof T> = P extends keyof T
    ? T[P] extends U
        ? P
        : never
    : never;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

interface Model {
    name: string;
    count: number;
    isReadonly: boolean;
    isEnable: boolean;
}

type cases = [
    Expect<
        Equal<
            PickByType<Model, boolean>,
            { isReadonly: boolean; isEnable: boolean }
        >
    >,
    Expect<Equal<PickByType<Model, string>, { name: string }>>,
    Expect<Equal<PickByType<Model, number>, { count: number }>>
];
