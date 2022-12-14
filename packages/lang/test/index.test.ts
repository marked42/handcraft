import { tokenize, parse, interpret, Context, ExprValue } from "../src";

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

describe("parse", () => {
    test("parse single expression", () => {
        expect(parse("a")).toEqual([{ type: "id", value: "a" }]);
        expect(parse("(a)")).toEqual([[{ type: "id", value: "a" }]]);
    });

    test("parse multiple expressions", () => {
        expect(parse("a b")).toEqual([
            { type: "id", value: "a" },
            { type: "id", value: "b" },
        ]);

        expect(parse("(a b)")).toEqual([
            [
                { type: "id", value: "a" },
                { type: "id", value: "b" },
            ],
        ]);

        expect(parse("(a b (c d))")).toEqual([
            [
                { type: "id", value: "a" },
                { type: "id", value: "b" },
                [
                    { type: "id", value: "c" },
                    { type: "id", value: "d" },
                ],
            ],
        ]);
    });
});

describe("interpreter", () => {
    test("interpret atom", () => {
        expect(interpret("1")).toEqual(1);
        expect(interpret('"a"')).toEqual("a");
    });

    test("interpret variable", () => {
        expect(() => interpret("a")).toThrowError();
        expect(interpret("a", new Context({ a: 1 }))).toEqual(1);
    });

    test("call expression", () => {
        expect(
            interpret(
                "(add 1 2)",
                new Context({
                    add: (left: ExprValue, right: ExprValue) => {
                        if (
                            typeof left === "number" &&
                            typeof right === "number"
                        ) {
                            return left + right;
                        }
                        if (
                            typeof left === "string" &&
                            typeof right === "string"
                        ) {
                            return left + right;
                        }

                        throw new Error("add only valid on string/number");
                    },
                })
            )
        ).toEqual(3);
    });
});
