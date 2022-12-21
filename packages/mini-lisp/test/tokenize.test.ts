import { tokenize, TokenType } from "../src";

describe("atoms", () => {
    test.each(["a", "+", "-", "*", "/", "=", ">", "<", ">=", "<=", "set!"])(
        "symbol",
        (symbol) => {
            expect(tokenize(symbol)).toEqual([
                { type: TokenType.Symbol, source: symbol, name: symbol },
            ]);
        }
    );

    test("string literal", () => {
        expect(tokenize('"hello-world"')).toEqual([
            {
                type: TokenType.String,
                source: '"hello-world"',
                value: "hello-world",
            },
        ]);

        expect(tokenize('(append "hello" "world")')).toEqual([
            {
                type: TokenType.Punctuator,
                source: "(",
            },
            {
                type: TokenType.Symbol,
                source: "append",
                name: "append",
            },
            {
                type: TokenType.String,
                source: '"hello"',
                value: "hello",
            },
            {
                type: TokenType.String,
                source: '"world"',
                value: "world",
            },
            {
                type: TokenType.Punctuator,
                source: ")",
            },
        ]);
    });

    test("number literal", () => {
        expect(tokenize("1")).toEqual([
            { type: TokenType.Number, source: "1", value: 1 },
        ]);
    });

    test("boolean literal", () => {
        expect(tokenize("#true")).toEqual([
            { type: TokenType.Boolean, source: "#true", value: true },
        ]);
        expect(tokenize("#t")).toEqual([
            { type: TokenType.Boolean, source: "#t", value: true },
        ]);
        expect(tokenize("#false")).toEqual([
            { type: TokenType.Boolean, source: "#false", value: false },
        ]);
        expect(tokenize("#f")).toEqual([
            { type: TokenType.Boolean, source: "#f", value: false },
        ]);
    });
});

describe("list", () => {
    test("list with a symbol", () => {
        expect(tokenize("(a)")).toEqual([
            { type: TokenType.Punctuator, source: "(" },
            { type: TokenType.Symbol, source: "a", name: "a" },
            { type: TokenType.Punctuator, source: ")" },
        ]);
    });

    test("list with multiple atoms", () => {
        expect(tokenize("(1 2)")).toEqual([
            { type: TokenType.Punctuator, source: "(" },
            { type: TokenType.Number, source: "1", value: 1 },
            { type: TokenType.Number, source: "2", value: 2 },
            { type: TokenType.Punctuator, source: ")" },
        ]);
    });

    test("list with nested list", () => {
        expect(tokenize("(1 (2))")).toEqual([
            { type: TokenType.Punctuator, source: "(" },
            { type: TokenType.Number, source: "1", value: 1 },
            { type: TokenType.Punctuator, source: "(" },
            { type: TokenType.Number, source: "2", value: 2 },
            { type: TokenType.Punctuator, source: ")" },
            { type: TokenType.Punctuator, source: ")" },
        ]);
    });
});
