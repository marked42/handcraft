/* _____________ Your Code Here _____________ */

type Without<T extends unknown[], U> = T extends [infer First, ...infer Rest]
    ? First extends (U extends unknown[] ? U[number] : U)
        ? Without<Rest, U>
        : [First, ...Without<Rest, U>]
    : T;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<Without<[1, 2], 1>, [2]>>,
    Expect<Equal<Without<[1, 2, 4, 1, 5], [1, 2]>, [4, 5]>>,
    Expect<Equal<Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>, []>>
];
