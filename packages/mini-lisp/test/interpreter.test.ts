import { interpret, Context } from "../src";

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
    test("+", () => {
        expect(interpret("(+ 1 2)")).toEqual(3);
    });

    test("first", () => {
        expect(interpret("(first (1 2))")).toEqual(1);
    });
});

describe("lambda", () => {
    test("single parameter", () => {
        expect(interpret('((lambda (x) x) "Lisp")')).toEqual("Lisp");
    });

    test("use built-in function", () => {
        expect(interpret("((lambda (x) (+ x x)) 1)")).toEqual(2);
    });

    test("closure", () => {
        expect(
            interpret('((lambda (a) ((lambda (b) (b a)) "b")) "a")')
        ).toEqual(["b", "a"]);
    });
});
