import { interpret, Context, ExprValue, Scope } from "../src";

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

test("literal atom", () => {
    expect(interpret("1")).toEqual(1);
    expect(interpret('"a"')).toEqual("a");
    expect(interpret("()")).toEqual([]);
    expect(interpret("(1)")).toEqual([1]);
    expect(interpret("(1 2)")).toEqual([1, 2]);
    expect(interpret("(1 (1 2))")).toEqual([1, [1, 2]]);
});

describe("variable", () => {
    test("throw on undefined variable", () => {
        expect(() => interpret("a")).toThrowError();
    });

    test("read variable", () => {
        expect(interpret("a", new Context({ a: 1 }))).toEqual(1);
    });
});

describe("call expression", () => {
    test("add", () => {
        expect(interpret("(add 1 2)", new Context(library))).toEqual(3);
    });

    test("first", () => {
        expect(interpret("(first (1 2))", new Context(library))).toEqual(1);
    });
});

describe("lambda", () => {
    test("single parameter", () => {
        expect(
            interpret('((lambda (x) x) "Lisp")', new Context(library))
        ).toEqual("Lisp");
    });

    test("use built-in function", () => {
        expect(
            interpret("((lambda (x) (add x x)) 1)", new Context(library))
        ).toEqual(2);
    });

    test("closure", () => {
        expect(
            interpret(
                '((lambda (a) ((lambda (b) (b a)) "b")) "a")',
                new Context(library)
            )
        ).toEqual(["b", "a"]);
    });
});
