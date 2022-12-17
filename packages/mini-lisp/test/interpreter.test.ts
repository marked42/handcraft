import { interpret, Context } from "../src";

test("literal atom", () => {
    expect(interpret("1")).toEqual(1);
    expect(interpret('"a"')).toEqual("a");
    expect(interpret("()")).toEqual([]);
    expect(interpret("(1)")).toEqual([1]);
    expect(interpret("(1 2)")).toEqual([1, 2]);
    expect(interpret("(1 (1 2))")).toEqual([1, [1, 2]]);
});

test("built in operators", () => {
    expect(interpret("(+ 1 2)")).toEqual(3);
    expect(interpret("(- 1 2)")).toEqual(-1);
    expect(interpret("(* 1 2)")).toEqual(2);
    expect(interpret("(/ 1 2)")).toEqual(0.5);
    expect(interpret("(= 1 2)")).toEqual(false);
    expect(interpret("(> 1 2)")).toEqual(false);
    expect(interpret("(>= 1 2)")).toEqual(false);
    expect(interpret("(< 1 2)")).toEqual(true);
    expect(interpret("(<= 1 2)")).toEqual(true);
});

test("string", () => {
    expect(interpret('(append "hello-" "world")')).toEqual("hello-world");
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

    test("-", () => {
        expect(interpret("(- 1 2)")).toEqual(-1);
    });

    test("*", () => {
        expect(interpret("(* 2 3)")).toEqual(6);
        expect(interpret("(* 0 3)")).toEqual(0);
    });

    test("/", () => {
        expect(interpret("(/ 3 3)")).toEqual(1);
        expect(interpret("(/ 0 3)")).toEqual(0);
        expect(interpret("(/ 3 0)")).toBe(Infinity);
        expect(interpret("(/ -1 0)")).toBe(-Infinity);
    });
    // '+':op.add, '-':op.sub, '*':op.mul, '/':op.truediv,
    // '>':op.gt, '<':op.lt, '>=':op.ge, '<=':op.le, '=':op.eq,

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
