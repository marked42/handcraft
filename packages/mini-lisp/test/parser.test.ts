import { ExpressionType, parse } from "../src";

describe("single expression", () => {
    test("atom", () => {
        expect(parse("a")).toEqual([
            { type: ExpressionType.Symbol, name: "a" },
        ]);
    });

    test("list", () => {
        expect(parse("(a)")).toEqual([
            {
                type: ExpressionType.List,
                items: [
                    {
                        type: ExpressionType.Symbol,
                        name: "a",
                    },
                ],
            },
        ]);
    });

    test("list with multiple elements", () => {
        expect(parse("(a b)")).toEqual([
            {
                type: ExpressionType.List,
                items: [
                    { type: ExpressionType.Symbol, name: "a" },
                    { type: ExpressionType.Symbol, name: "b" },
                ],
            },
        ]);

        expect(parse("(a b)")).toEqual([
            {
                type: ExpressionType.List,
                items: [
                    { type: ExpressionType.Symbol, name: "a" },
                    { type: ExpressionType.Symbol, name: "b" },
                ],
            },
        ]);
    });
    test("list with nested list", () => {
        expect(parse("(a b (c d))")).toEqual([
            {
                type: ExpressionType.List,
                items: [
                    { type: ExpressionType.Symbol, name: "a" },
                    { type: ExpressionType.Symbol, name: "b" },
                    {
                        type: ExpressionType.List,
                        items: [
                            {
                                type: ExpressionType.Symbol,
                                name: "c",
                            },
                            {
                                type: ExpressionType.Symbol,
                                name: "d",
                            },
                        ],
                    },
                ],
            },
        ]);
    });
});

test("multiple expressions", () => {
    expect(parse("a b")).toEqual([
        { type: ExpressionType.Symbol, name: "a" },
        { type: ExpressionType.Symbol, name: "b" },
    ]);
});
