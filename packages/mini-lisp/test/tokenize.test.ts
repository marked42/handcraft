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
});

describe("list", () => {
    // FIXME: debug failed
    /**
     * cd /Users/penghui/coding/handcraft ; /usr/bin/env 'NODE_OP
TIONS=--require "/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/ms-vs
code.js-debug/src/bootloader.bundle.js" --inspect-publish-uid=http' 'VSCODE_INSPECTOR_OPTIONS
={"inspectorIpc":"/var/folders/pt/_nynw_z11xx2fvyq8p8qs0fc0000gn/T/node-cdp.65570-3.sock","de
ferredMode":false,"waitForDebugger":"","execPath":"/Users/penghui/.nvm/versions/node/v16.14.2
/bin/node","onlyEntrypoint":false,"autoAttachMode":"always","fileCallback":"/var/folders/pt/_
nynw_z11xx2fvyq8p8qs0fc0000gn/T/node-debug-callback-26cbd6803d3d2889"}' /Users/penghui/.nvm/v
ersions/node/v16.14.2/bin/node ./node_modules/.bin/jest --runInBand --watchAll=false --testNa
mePattern tokenize\ multiple\ tokens --runTestsByPath /Users/penghui/coding/handcraft/package
s/mini-lisp/test/index.test.ts
Debugger attached.
Waiting for the debugger to disconnect...
/Users/penghui/coding/handcraft/node_modules/.bin/jest:2
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")
          ^^^^^^^
     */
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
