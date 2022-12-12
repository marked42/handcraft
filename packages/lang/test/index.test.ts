import { tokenize } from "../src";

describe("tokenize", () => {
    test("single token", () => {
        expect(tokenize("a")).toEqual([{ type: "id", value: "a" }]);
        expect(tokenize('"hello-world"')).toEqual([
            { type: "string", value: "hello-world" },
        ]);
        expect(tokenize("1")).toEqual([{ type: "number", value: 1 }]);

        expect(tokenize('"hello world"')).toMatchInlineSnapshot(`
Array [
  Object {
    "type": "unknown",
    "value": "\\"hello",
  },
  Object {
    "type": "unknown",
    "value": "world\\"",
  },
]
`);
    });

    // FIXME: debug failed
    test("multiple tokens", () => {
        expect(tokenize("(a)")).toEqual([
            { type: "punctuator", value: "(" },
            { type: "id", value: "a" },
            { type: "punctuator", value: ")" },
        ]);

        expect(tokenize("(1 2)")).toEqual([
            { type: "punctuator", value: "(" },
            { type: "number", value: 1 },
            { type: "number", value: 2 },
            { type: "punctuator", value: ")" },
        ]);

        expect(tokenize("(1 (2))")).toEqual([
            { type: "punctuator", value: "(" },
            { type: "number", value: 1 },
            { type: "punctuator", value: "(" },
            { type: "number", value: 2 },
            { type: "punctuator", value: ")" },
            { type: "punctuator", value: ")" },
        ]);
    });
});
