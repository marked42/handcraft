// type Fibonacci<T extends number> = FibHelper<NumberToArray<T>>['length']

// type NumberToArray<T extends number, R extends unknown[] = []> = R['length'] extends T ? R : NumberToArray<T, [unknown, ...R]>

// type V = NumberToArray<2>

// type FibHelper<A extends unknown[]> =
//   A extends []
//   ? []
//   : A extends [unknown]
//     ? [unknown]
//     : A extends [unknown, unknown, ...infer Rest]
//       ? [ ...FibHelper<Rest>, ...FibHelper<[any, ...Rest]>,]
//       : []

type Fibonacci<
    T extends number,
    No extends 1[] = [1, 1, 1],
    N_2 extends 1[] = [1],
    N_1 extends 1[] = [1]
> = T extends 1 | 2
    ? 1
    : T extends No["length"]
    ? [...N_2, ...N_1]["length"]
    : Fibonacci<T, [...No, 1], N_1, [...N_2, ...N_1]>;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<Fibonacci<1>, 1>>,
    Expect<Equal<Fibonacci<2>, 1>>,
    Expect<Equal<Fibonacci<3>, 2>>,
    Expect<Equal<Fibonacci<8>, 21>>
];
