type IsTuple<T> =
    // exclude bottom type never
    [T] extends [never]
        ? false
        : // otherwise it satifies this branch
        [T] extends [readonly unknown[]]
        ? number extends T["length"]
            ? false
            : true
        : false;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<IsTuple<[]>, true>>,
    Expect<Equal<IsTuple<[number]>, true>>,
    Expect<Equal<IsTuple<readonly [1]>, true>>,
    Expect<Equal<IsTuple<{ length: 1 }>, false>>,
    Expect<Equal<IsTuple<number[]>, false>>,
    Expect<Equal<IsTuple<never>, false>>
];
