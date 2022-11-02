interface TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
}

// Type instantiation is excessively deep and possibly infinite.(2589)
// Expression produces a union type that is too complex to represent.(2590)
// type InorderTraversal1<T extends TreeNode | null> =
//   T extends TreeNode
//   ? [...InorderTraversal1<T['left']>, T['val'], ...InorderTraversal1<T['right']>]
//   : T extends null ? [] : never

type InorderTraversal<T extends TreeNode | null> = [T] extends [TreeNode]
    ? [
          ...InorderTraversal<T["left"]>,
          T["val"],
          ...InorderTraversal<T["right"]>
      ]
    : [];

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

const tree1 = {
    val: 1,
    left: null,
    right: {
        val: 2,
        left: {
            val: 3,
            left: null,
            right: null,
        },
        right: null,
    },
} as const;

const tree2 = {
    val: 1,
    left: null,
    right: null,
} as const;

const tree3 = {
    val: 1,
    left: {
        val: 2,
        left: null,
        right: null,
    },
    right: null,
} as const;

const tree4 = {
    val: 1,
    left: null,
    right: {
        val: 2,
        left: null,
        right: null,
    },
} as const;

type cases = [
    Expect<Equal<InorderTraversal<null>, []>>,
    Expect<Equal<InorderTraversal<typeof tree1>, [1, 3, 2]>>,
    Expect<Equal<InorderTraversal<typeof tree2>, [1]>>,
    Expect<Equal<InorderTraversal<typeof tree3>, [2, 1]>>,
    Expect<Equal<InorderTraversal<typeof tree4>, [1, 2]>>
];
