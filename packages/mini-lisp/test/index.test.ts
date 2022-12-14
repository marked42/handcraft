import { tokenize, parse, interpret, Context, ExprValue, Scope } from "../src";

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

const library: Scope = {
    add: (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
            return left + right;
        }

        throw new Error("add only valid on string/number");
    },
    first: (value: ExprValue) => {
        if (!Array.isArray(value)) {
            throw new Error(
                `first applied to invalid value ${value.toString()}`
            );
        }
        return value[0];
    },
};

describe("interpreter", () => {
    test("interpret atom", () => {
        expect(interpret("1")).toEqual(1);
        expect(interpret('"a"')).toEqual("a");
        expect(interpret("()")).toEqual([]);
        expect(interpret("(1)")).toEqual([1]);
        expect(interpret("(1 2)")).toEqual([1, 2]);
        expect(interpret("(1 (1 2))")).toEqual([1, [1, 2]]);
    });

    test("interpret variable", () => {
        expect(() => interpret("a")).toThrowError();
        expect(interpret("a", new Context({ a: 1 }))).toEqual(1);
    });

    test("call expression", () => {
        expect(interpret("(add 1 2)", new Context(library))).toEqual(3);
        expect(interpret("(first (1 2))", new Context(library))).toEqual(1);
    });

    test("lambda expression", () => {
        expect(
            interpret("((lambda (x) (add x x)) 1)", new Context(library))
        ).toEqual(2);
        expect(
            interpret('((lambda (x) x) "Lisp")', new Context(library))
        ).toEqual("Lisp");

        expect(
            interpret(
                '((lambda (a) ((lambda (b) (b a)) "b")) "a")',
                new Context(library)
            )
        ).toEqual(["b", "a"]);
    });
});
