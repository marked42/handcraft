type Integer<T extends number> = number extends T
    ? never
    : `${T}` extends `${string}.0`
    ? T
    : `${T}` extends `${string}.${string}`
    ? never
    : T;

/* _____________ Test Cases _____________ */
import type {
    ExpectFalse,
    NotEqual,
    Equal,
    Expect,
} from "@type-challenges/utils";

let x = 1;
let y = 1 as const;

type cases1 = [
    Expect<Equal<Integer<1>, 1>>,
    Expect<Equal<Integer<1.1>, never>>,
    Expect<Equal<Integer<1.0>, 1>>,
    Expect<Equal<Integer<typeof x>, never>>,
    Expect<Equal<Integer<typeof y>, 1>>
];
