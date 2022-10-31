/* _____________ Your Code Here _____________ */
type Includes<T extends readonly any[], U> = T extends [
    infer First,
    ...infer Rest
]
    ? Equal<First, U> extends true
        ? true
        : Includes<Rest, U>
    : false;

// 使用类型参数Result记录结果
// type Unique<T extends unknown[], Result extends unknown[] = []> =
//   T extends [infer First, ...infer Rest]
//   ? Includes<Result, First> extends true
//     ? Unique<Rest, Result>
//     : Unique<Rest, [...Result, First]>
//   : Result

// 逆向处理最终结果元素顺序才正确
type Unique<T> = T extends [...infer H, infer T]
    ? Includes<H, T> extends true
        ? [...Unique<H>]
        : [...Unique<H>, T]
    : [];

// type Unique<T extends unknown[]> =
//   T extends [infer First, ...infer Rest]
//   ? Includes<Rest, First> extends true
//     ? Unique<Rest>
//     : [First, ...Unique<Rest>]
//   : []

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<Unique<[1, 1, 2, 2, 3, 3]>, [1, 2, 3]>>,
    Expect<Equal<Unique<[1, 2, 3, 4, 4, 5, 6, 7]>, [1, 2, 3, 4, 5, 6, 7]>>,
    Expect<Equal<Unique<[1, "a", 2, "b", 2, "a"]>, [1, "a", 2, "b"]>>,
    Expect<
        Equal<
            Unique<[string, number, 1, "a", 1, string, 2, "b", 2, number]>,
            [string, number, 1, "a", 2, "b"]
        >
    >,
    Expect<
        Equal<
            Unique<[unknown, unknown, any, any, never, never]>,
            [unknown, any, never]
        >
    >
];
