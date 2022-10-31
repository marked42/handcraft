type GreaterThan<
    T extends number,
    U extends number,
    Count extends unknown[] = []
> = Count["length"] extends U
    ? Count["length"] extends T
        ? false
        : true
    : Count["length"] extends T
    ? false
    : GreaterThan<T, U, [...Count, unknown]>;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<GreaterThan<1, 0>, true>>,
    Expect<Equal<GreaterThan<5, 4>, true>>,
    Expect<Equal<GreaterThan<4, 5>, false>>,
    Expect<Equal<GreaterThan<0, 0>, false>>,
    Expect<Equal<GreaterThan<20, 20>, false>>,
    Expect<Equal<GreaterThan<10, 100>, false>>,
    Expect<Equal<GreaterThan<111, 11>, true>>
];
