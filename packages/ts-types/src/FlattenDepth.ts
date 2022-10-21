type FlattenDepth<
    T extends unknown[],
    Depth extends number = 1,
    Count extends unknown[] = []
> = T extends [infer First, ...infer Rest]
    ? Count["length"] extends Depth // 已经到了要求的深度
        ? T // 不再递归展开
        : First extends unknown[]
        ? // 注意这里 First 被展开了所以使用[...Count, unknown]使数组长度增加1，代表嵌套深度加深
          // 剩余的每个元素递归也需要深度加1，但是这些元素整体组成了 Rest 数组被使用，抵消了嵌套深度增加，所以仍然使用Count
          [
              ...FlattenDepth<First, Depth, [...Count, unknown]>,
              ...FlattenDepth<Rest, Depth, Count>
          ]
        : [First, ...FlattenDepth<Rest, Depth, Count>]
    : T;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<FlattenDepth<[]>, []>>,
    Expect<Equal<FlattenDepth<[1, 2, 3, 4]>, [1, 2, 3, 4]>>,
    Expect<Equal<FlattenDepth<[1, [2]]>, [1, 2]>>,
    Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2>, [1, 2, 3, 4, [5]]>>,
    Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]]>, [1, 2, 3, 4, [[5]]]>>,
    Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 3>, [1, 2, 3, 4, [5]]>>,
    Expect<
        Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 19260817>, [1, 2, 3, 4, 5]>
    >
];
