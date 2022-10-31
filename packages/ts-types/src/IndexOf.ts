/* _____________ Your Code Here _____________ */

type IndexOf<T extends unknown[], U, Count extends unknown[] = []> = Equal<
    U,
    T[Count["length"]]
> extends true
    ? Count["length"]
    : Count["length"] extends T["length"]
    ? -1
    : IndexOf<T, U, [...Count, unknown]>;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<IndexOf<[1, 2, 3], 2>, 1>>,
    Expect<Equal<IndexOf<[2, 6, 3, 8, 4, 1, 7, 3, 9], 3>, 2>>,
    Expect<Equal<IndexOf<[0, 0, 0], 2>, -1>>,
    Expect<Equal<IndexOf<[string, 1, number, "a"], number>, 2>>,
    Expect<Equal<IndexOf<[string, 1, number, "a", any], any>, 4>>
];
