import { createBoolean, createNumber, ExpressionType, interpret } from "../src";

test("literal atom", () => {
    expect(interpret("1")).toEqual({ type: ExpressionType.Number, value: 1 });
    expect(interpret('"a"')).toEqual({
        type: ExpressionType.String,
        value: "a",
    });
});

const expectNumber = (input: string, result: number) => {
    expect(interpret(input)).toEqual(createNumber(result));
};

const expectBoolean = (input: string, result: boolean) => {
    expect(interpret(input)).toEqual(createBoolean(result));
};

describe("arithmetic operators", () => {
    test("+", () => {
        expectNumber("(+ 1 2)", 3);
    });

    test("-", () => {
        expectNumber("(- 2 1)", 1);
        expectNumber("(- 1 2)", -1);
    });

    test("*", () => {
        expectNumber("(* 2 3)", 6);
        expectNumber("(* 0 3)", 0);
        expectNumber("(* -2 3)", -6);
    });

    test("/", () => {
        expectNumber("(/ 3 3)", 1);
        expectNumber("(/ 0 3)", 0);
        expectNumber("(/ 3 0)", Infinity);
        expectNumber("(/ -1 0)", -Infinity);
    });

    test("expt", () => {
        expectNumber("(expt 2 3)", 8);
        expectNumber("(expt 0 3)", 0);
    });

    test("round", () => {
        expectNumber("(round 2.3)", 2);
        expectNumber("(round 2.5)", 3);
        expectNumber("(round 2.9)", 3);
        expectNumber("(round -2.3)", -2);
        expectNumber("(round -2.5)", -2);
        expectNumber("(round -2.9)", -3);
    });

    test("abs", () => {
        expectNumber("(abs 1)", 1);
        expectNumber("(abs 0)", 0);
        expectNumber("(abs -1)", 1);
    });

    test("number?", () => {
        expectBoolean("(number? 1)", true);
        expectBoolean('(number? "1")', false);
        expectBoolean("(number? (1))", false);
    });

    test("max", () => {
        expectNumber("(max 2 3)", 3);
        expectNumber("(max 0 -1)", 0);
    });

    test("min", () => {
        expectNumber("(min 2 3)", 2);
        expectNumber("(min 0 -1)", -1);
    });
});

// describe("comparison operators", () => {
//     test("=", () => {
//         expect(interpret("(= 1 2)")).toEqual(false);
//     });
//     test(">", () => {
//         expect(interpret("(> 1 2)")).toEqual(false);
//     });
//     test(">=", () => {
//         expect(interpret("(>= 1 2)")).toEqual(false);
//     });
//     test("<", () => {
//         expect(interpret("(< 1 2)")).toEqual(true);
//     });
//     test("<=", () => {
//         expect(interpret("(<= 1 2)")).toEqual(true);
//     });
// });

// test("string", () => {
//     expect(interpret('(append "hello" "world")')).toEqual("helloworld");
// });

// describe("variable", () => {
//     test("throw on undefined variable", () => {
//         expect(() => interpret("a")).toThrowError();
//     });

//     test("read variable", () => {
//         expect(interpret("a", new Context({ a: 1 }))).toEqual(1);
//     });

//     test("define variable", () => {
//         expect(interpret("(begin (define r 10) r)")).toEqual(10);
//         expect(interpret("(begin (define r 10) (* 2 (* r r)))")).toEqual(200);
//     });

//     test("cannot redefine existed variable", () => {
//         expect(() =>
//             interpret("(begin (define r 10) (define r 11))")
//         ).toThrowError();
//     });

//     test("cannot redefine builtin variable", () => {
//         expect(() => interpret("(define + 10)")).toThrowError();
//     });

//     test("cannot redefine builtin variable", () => {
//         expect(() =>
//             interpret("(begin (define a 10) ((lambda () (define a 1))))")
//         ).toThrowError();
//     });

//     test("set existing variable", () => {
//         expect(interpret("(begin (define a 1) (set! a 2) a)")).toEqual(2);
//     });
// });

// test("if", () => {
//     expect(interpret("(if 1 2 3)")).toEqual(2);
//     expect(interpret("(if 0 2 3)")).toEqual(3);
// });

// describe("call expression", () => {
//     test("car", () => {
//         expect(interpret("(car (1 2 3))")).toEqual(1);
//         expect(() => interpret("(car )")).toThrowError();
//         expect(() => interpret("(car 1)")).toThrowError();
//     });

//     test("cdr", () => {
//         expect(interpret("(cdr (1 2 3))")).toEqual([2, 3]);
//         expect(() => interpret("(cdr )")).toThrowError();
//         expect(() => interpret("(cdr 1)")).toThrowError();
//     });

//     test("abs", () => {
//         expect(interpret("(abs 1)")).toEqual(1);
//         expect(interpret("(abs 0)")).toEqual(0);
//         expect(interpret("(abs -1)")).toEqual(1);
//     });

//     test("apply", () => {
//         expect(interpret("(apply + (1 2))")).toEqual(3);
//         expect(() => interpret("(apply + )")).toThrowError();
//         expect(() => interpret("(apply + (1 2) 3)")).toThrowError();
//         expect(() => interpret("(apply 1 (1 2))")).toThrowError();
//     });

//     test("begin", () => {
//         expect(interpret("(begin 1 2 3)")).toEqual(3);
//         expect(() => interpret("(begin)")).toThrowError();
//     });

//     test("length", () => {
//         expect(interpret("(length ())")).toEqual(0);
//         expect(interpret("(length (1 2 3))")).toEqual(3);
//         expect(() => interpret("(length)")).toThrowError();
//         expect(() => interpret("(length 1)")).toThrowError();
//     });

//     test("list", () => {
//         expect(interpret("(list 1 2 3)")).toEqual([1, 2, 3]);
//         expect(interpret("(list)")).toEqual([]);
//     });

//     test("list?", () => {
//         expect(interpret("(list? (list 1 2 3))")).toEqual(true);
//         expect(interpret("(list? (list))")).toEqual(true);
//         expect(interpret("(list? ())")).toEqual(true);
//         expect(interpret("(list? 1)")).toEqual(false);
//         // FIXME: treat pair as list now, needs confirm
//         expect(interpret("(list? (cons 1 2))")).toEqual(true);
//     });

//     test("max", () => {
//         expect(interpret("(max 1)")).toEqual(1);
//         expect(interpret("(max 1 2 3)")).toEqual(3);
//         expect(() => interpret("(max ())")).toThrowError();
//         expect(() => interpret("(max)")).toThrowError();
//     });

//     test("min", () => {
//         expect(interpret("(min 1)")).toEqual(1);
//         expect(interpret("(min 1 2 3)")).toEqual(1);
//         expect(() => interpret("(min ())")).toThrowError();
//         expect(() => interpret("(min)")).toThrowError();
//     });

//     // FIXME: need confirm
//     test("not", () => {
//         expect(interpret("(not 1)")).toEqual(false);
//     });

//     // FIXME: need confirm
//     test("null?", () => {
//         expect(interpret("(null? 1)")).toEqual(false);
//     });

//     test("number?", () => {
//         expect(interpret("(number? 1)")).toEqual(true);
//         expect(interpret("(number? ())")).toEqual(false);
//     });

//     test("round", () => {
//         expect(interpret("(round 1.1)")).toEqual(1);
//         expect(() => interpret("(round ())")).toThrowError();
//     });
// });

// describe("procedure", () => {
//     test("procedure?", () => {
//         expect(interpret("(procedure? (lambda (x) (x)))")).toEqual(true);
//         expect(interpret("(procedure? 1)")).toEqual(false);
//     });
// });

// describe("pair", () => {
//     test("cons", () => {
//         expect(interpret("(cons 1 2)")).toEqual([1, 2]);
//     });

//     test("con?", () => {
//         expect(interpret("(pair? (cons 1 2))")).toEqual(true);
//     });
// });

// describe("lambda", () => {
//     test("single parameter", () => {
//         expect(interpret('((lambda (x) x) "Lisp")')).toEqual("Lisp");
//     });

//     test("use built-in function", () => {
//         expect(interpret("((lambda (x) (+ x x)) 1)")).toEqual(2);
//     });

//     test("closure", () => {
//         expect(
//             interpret('((lambda (a) ((lambda (b) (b a)) "b")) "a")')
//         ).toEqual(["b", "a"]);
//     });
// });
