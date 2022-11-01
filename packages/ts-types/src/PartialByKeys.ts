type MyMerge<T> = { [P in keyof T]: T[P] };
type PartialByKeys<T, K extends keyof T = keyof T> = MyMerge<
    { [P in keyof T as P extends K ? P : never]?: T[P] } & {
        [P in Exclude<keyof T, K>]: T[P];
    }
>;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

interface User {
    name: string;
    age: number;
    address: string;
}

interface UserPartialName {
    name?: string;
    age: number;
    address: string;
}

interface UserPartialNameAndAge {
    name?: string;
    age?: number;
    address: string;
}

type cases = [
    Expect<Equal<PartialByKeys<User, "name">, UserPartialName>>,
    Expect<Equal<PartialByKeys<User, "name" | "age">, UserPartialNameAndAge>>,
    Expect<Equal<PartialByKeys<User>, Partial<User>>>,
    // @ts-expect-error
    Expect<Equal<PartialByKeys<User, "name" | "unknown">, UserPartialName>>
];
