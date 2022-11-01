type PascalCase<S extends string> = S extends `${infer F}_${infer Rest}`
    ? `${Capitalize<Lowercase<F>>}${PascalCase<Rest>}`
    : Capitalize<Lowercase<S>>;

type CamelCase<S extends string> = Uncapitalize<PascalCase<S>>;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<CamelCase<"foobar">, "foobar">>,
    Expect<Equal<CamelCase<"FOOBAR">, "foobar">>,
    Expect<Equal<CamelCase<"foo_bar">, "fooBar">>,
    Expect<Equal<CamelCase<"foo_bar_hello_world">, "fooBarHelloWorld">>,
    Expect<Equal<CamelCase<"HELLO_WORLD_WITH_TYPES">, "helloWorldWithTypes">>,
    Expect<Equal<CamelCase<"-">, "-">>,
    Expect<Equal<CamelCase<"">, "">>,
    Expect<Equal<CamelCase<"😎">, "😎">>
];
