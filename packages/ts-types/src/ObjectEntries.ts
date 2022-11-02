type ObjectEntries<T, K extends keyof T = keyof T> = K extends K
    ? [K, HandleUndefined<T, K>]
    : never;

type HandleUndefined<F, S extends keyof F> = F[S] extends infer R | undefined
    ? R
    : F[S];

type V1 = HandleUndefined<Partial<{ a?: string }>, "a">;
type V2 = HandleUndefined<Partial<{ a: string }>, "a">;
type V3 = HandleUndefined<Partial<{ a?: string | undefined }>, "a">;
type V4 = HandleUndefined<Partial<{ a: string | undefined }>, "a">;

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";
type V = ObjectEntries<Partial<Model>>;
interface Model {
    name: string;
    age: number;
    locations: string[] | null;
}

type ModelEntries =
    | ["name", string]
    | ["age", number]
    | ["locations", string[] | null];

type cases = [
    Expect<Equal<ObjectEntries<Model>, ModelEntries>>,
    Expect<Equal<ObjectEntries<Partial<Model>>, ModelEntries>>,
    Expect<Equal<ObjectEntries<{ key?: undefined }>, ["key", undefined]>>,
    Expect<Equal<ObjectEntries<{ key: undefined }>, ["key", undefined]>>
];
