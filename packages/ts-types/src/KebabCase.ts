/* _____________ Your Code Here _____________ */
type IsUpperCase<C extends string> = C extends Lowercase<C> ? false : true;
type KebabCase<S extends string> = S extends `${infer H}${infer Rest}`
    ? `${Lowercase<H>}${KebabCaseHelper<Rest>}`
    : S;

type KebabCaseHelper<S extends string> = S extends `${infer H}${infer Rest}`
    ? IsUpperCase<H> extends true
        ? `-${Lowercase<H>}${KebabCaseHelper<Rest>}`
        : `${H}${KebabCaseHelper<Rest>}`
    : S;

type T = KebabCase<"foo-bar">;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<KebabCase<"FooBarBaz">, "foo-bar-baz">>,
    Expect<Equal<KebabCase<"fooBarBaz">, "foo-bar-baz">>,
    Expect<Equal<KebabCase<"foo-bar">, "foo-bar">>,
    Expect<Equal<KebabCase<"foo_bar">, "foo_bar">>,
    Expect<Equal<KebabCase<"Foo-Bar">, "foo--bar">>,
    Expect<Equal<KebabCase<"ABC">, "a-b-c">>,
    Expect<Equal<KebabCase<"-">, "-">>,
    Expect<Equal<KebabCase<"">, "">>,
    Expect<Equal<KebabCase<"😎">, "😎">>
];
