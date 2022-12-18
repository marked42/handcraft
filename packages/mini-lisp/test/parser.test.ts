import { parse, TokenType, parseV2, ExpressionType } from "../src";

describe("single expression", () => {
    test("atom", () => {
        expect(parse("a")).toEqual([
            { type: TokenType.Symbol, source: "a", name: "a" },
        ]);

        expect(parseV2("a")).toEqual([
            { type: ExpressionType.Symbol, name: "a" },
        ]);
    });

    test("list", () => {
        expect(parse("(a)")).toEqual([
            [{ type: TokenType.Symbol, source: "a", name: "a" }],
        ]);

        expect(parseV2("(a)")).toEqual([
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
            [
                { type: TokenType.Symbol, source: "a", name: "a" },
                { type: TokenType.Symbol, source: "b", name: "b" },
            ],
        ]);

        expect(parseV2("(a b)")).toEqual([
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
            [
                { type: TokenType.Symbol, source: "a", name: "a" },
                { type: TokenType.Symbol, source: "b", name: "b" },
                [
                    { type: TokenType.Symbol, source: "c", name: "c" },
                    { type: TokenType.Symbol, source: "d", name: "d" },
                ],
            ],
        ]);

        expect(parseV2("(a b (c d))")).toEqual([
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
        { type: TokenType.Symbol, source: "a", name: "a" },
        { type: TokenType.Symbol, source: "b", name: "b" },
    ]);

    expect(parseV2("a b")).toEqual([
        { type: ExpressionType.Symbol, name: "a" },
        { type: ExpressionType.Symbol, name: "b" },
    ]);
});
