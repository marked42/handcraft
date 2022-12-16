import { parse, TokenType } from "../src";

describe("single expression", () => {
    test("atom", () => {
        expect(parse("a")).toEqual([
            { type: TokenType.Symbol, source: "a", name: "a" },
        ]);
    });

    test("list", () => {
        expect(parse("(a)")).toEqual([
            [{ type: TokenType.Symbol, source: "a", name: "a" }],
        ]);
    });

    test("list with multiple elements", () => {
        expect(parse("(a b)")).toEqual([
            [
                { type: TokenType.Symbol, source: "a", name: "a" },
                { type: TokenType.Symbol, source: "b", name: "b" },
            ],
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
    });
});

test("multiple expressions", () => {
    expect(parse("a b")).toEqual([
        { type: TokenType.Symbol, source: "a", name: "a" },
        { type: TokenType.Symbol, source: "b", name: "b" },
    ]);
});
