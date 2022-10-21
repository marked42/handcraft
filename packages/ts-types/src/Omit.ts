type MyOmit<T extends object, K extends keyof T> = {
    [P in Exclude<keyof T, K>]: T[P];
};

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from "@type-challenges/utils";

type cases = [
    Expect<Equal<Expected1, MyOmit<Todo, "description">>>,
    Expect<Equal<Expected2, MyOmit<Todo, "description" | "completed">>>
];

// @ts-expect-error
type error = MyOmit<Todo, "description" | "invalid">;

interface Todo {
    title: string;
    description: string;
    completed: boolean;
}

interface Expected1 {
    title: string;
    completed: boolean;
}

interface Expected2 {
    title: string;
}
