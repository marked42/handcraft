/**
 * 映射的思路
 *
 * 1. 首先使用映射类型将元组的每个值进行映射，检查和U是否相等
 * 2. 然后使用索引类型取出元组值的union类型，其中每个元素是true或者false
 * 3. 如果union类型中包含true则代表至少有一个true，也就元组中包含元素，使用条件类型返回结果值
 */
type Includes<T extends readonly any[], U> = true extends {
    [P in keyof T]: Equal<T[P], U>;
}[number]
    ? true
    : false;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type v = Includes<[false, 2, 3, 5, 6, 7], false>;

type cases = [
    Expect<
        Equal<Includes<["Kars", "Esidisi", "Wamuu", "Santana"], "Kars">, true>
    >,
    Expect<
        Equal<Includes<["Kars", "Esidisi", "Wamuu", "Santana"], "Dio">, false>
    >,
    Expect<Equal<Includes<[1, 2, 3, 5, 6, 7], 7>, true>>,
    Expect<Equal<Includes<[1, 2, 3, 5, 6, 7], 4>, false>>,
    Expect<Equal<Includes<[1, 2, 3], 2>, true>>,
    Expect<Equal<Includes<[1, 2, 3], 1>, true>>,
    Expect<Equal<Includes<[{}], { a: "A" }>, false>>,
    Expect<Equal<Includes<[boolean, 2, 3, 5, 6, 7], false>, false>>,
    Expect<Equal<Includes<[true, 2, 3, 5, 6, 7], boolean>, false>>,
    Expect<Equal<Includes<[false, 2, 3, 5, 6, 7], false>, true>>,
    Expect<Equal<Includes<[{ a: "A" }], { readonly a: "A" }>, false>>,
    Expect<Equal<Includes<[{ readonly a: "A" }], { a: "A" }>, false>>,
    Expect<Equal<Includes<[1], 1 | 2>, false>>,
    Expect<Equal<Includes<[1 | 2], 1>, false>>,
    Expect<Equal<Includes<[null], undefined>, false>>,
    Expect<Equal<Includes<[undefined], null>, false>>
];
