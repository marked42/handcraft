import {
    createBoolean,
    createList,
    createNumber,
    createString,
    ExpressionType,
    interpret,
    NullValue,
    ListExpression,
} from "../src";

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

const expectString = (input: string, result: string) => {
    expect(interpret(input)).toEqual(createString(result));
};

const expectNull = (input: string) => {
    expect(interpret(input)).toBe(NullValue);
};

const expectList = (input: string, list: ListExpression) => {
    expect(interpret(input)).toEqual(list);
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

describe("comparison operators", () => {
    test("=", () => {
        expectBoolean("(= 1 1)", true);
        expectBoolean("(= 1 2)", false);
    });
    test(">", () => {
        expectBoolean("(> 2 1)", true);
        expectBoolean("(> 2 2)", false);
        expectBoolean("(> 1 2)", false);
    });
    test(">=", () => {
        expectBoolean("(>= 2 1)", true);
        expectBoolean("(>= 2 2)", true);
        expectBoolean("(>= 1 2)", false);
    });
    test("<", () => {
        expectBoolean("(< 1 2)", true);
        expectBoolean("(< 1 1)", false);
        expectBoolean("(< 2 1)", false);
    });
    test("<=", () => {
        expectBoolean("(<= 1 2)", true);
        expectBoolean("(<= 1 1)", true);
        expectBoolean("(<= 2 1)", false);
    });
});

test("string", () => {
    expectString('(append "hello" "world")', "helloworld");
});

describe("logical", () => {
    test("literal", () => {
        expectBoolean("#t", true);
        expectBoolean("#true", true);
        expectBoolean("#f", false);
        expectBoolean("#false", false);
    });

    describe("not", () => {
        test("revert boolean value when receiving one argument", () => {
            expectBoolean("(not #t)", false);
            expectBoolean("(not #true)", false);
            expectBoolean("(not #f)", true);
            expectBoolean("(not #false)", true);
        });

        test("throw when receiving zero arguments", () => {
            expect(() => interpret("(not)")).toThrowError();
        });
        test("throw when receiving multiple arguments", () => {
            expect(() => interpret("(not)")).toThrowError();
        });
    });

    describe("and", () => {
        test("return true when all arguments are true", () => {
            expectBoolean("(and #t)", true);
            expectBoolean("(and #t #t)", true);
            expectBoolean("(and #t #t #t)", true);
        });

        test("return false when any argument is false", () => {
            expectBoolean("(and #f)", false);
            expectBoolean("(and #t #f)", false);
            expectBoolean("(and #t #t #f)", false);
        });

        test("throw when receiving zero arguments", () => {
            expect(() => interpret("(and)")).toThrowError();
        });
    });

    describe("or", () => {
        test("return true when any argument are true", () => {
            expectBoolean("(or #t)", true);
            expectBoolean("(or #f #t)", true);
            expectBoolean("(or #f #f #t)", true);
        });

        test("return false when all arguments are false", () => {
            expectBoolean("(and #f)", false);
            expectBoolean("(and #f #f)", false);
            expectBoolean("(and #f #f #f)", false);
        });

        test("throw when receiving zero arguments", () => {
            expect(() => interpret("(or)")).toThrowError();
        });
    });
});

describe("list", () => {
    describe("literal", () => {
        test("empty list", () => {
            expectList("()", createList([]));
        });

        test("list with 1 item", () => {
            expectList("(1)", createList([createNumber(1)]));
        });

        test("list with multiple items", () => {
            expectList(
                '(1 "2")',
                createList([createNumber(1), createString("2")])
            );
        });

        test("nested list", () => {
            expectList(
                '(1 "2" (3, (4)))',
                createList([
                    createNumber(1),
                    createString("2"),
                    createList([
                        createNumber(3),
                        createList([createNumber(4)]),
                    ]),
                ])
            );
        });
    });

    describe("create list with list procedure", () => {
        test("empty list", () => {
            expectList("(list)", createList([]));
        });

        test("list with 1 item", () => {
            expectList("(list 1)", createList([createNumber(1)]));
        });

        test("list with multiple items", () => {
            expectList(
                '(list 1 "2")',
                createList([createNumber(1), createString("2")])
            );
        });

        test("nested list", () => {
            expectList(
                '(list 1 "2" (list 3, (list 4)))',
                createList([
                    createNumber(1),
                    createString("2"),
                    createList([
                        createNumber(3),
                        createList([createNumber(4)]),
                    ]),
                ])
            );
        });
    });

    describe("list?", () => {
        test("return true on list", () => {
            expectBoolean("(list? ())", true);
            expectBoolean("(list? (1))", true);
        });

        test("return false on non list value", () => {
            expectBoolean("(list? 1)", false);
            expectBoolean('(list? "1")', false);
            expectBoolean("(list? #t)", false);
        });
    });

    describe("null?", () => {
        test("return true empty list", () => {
            expectBoolean("(null? (list))", true);
        });

        test("return false for non-empty list", () => {
            expectBoolean("(null? (list (1 2)))", false);
        });

        test("return false for atom", () => {
            expectBoolean("(null? 1)", false);
            expectBoolean("(null? #t)", false);
            expectBoolean('(null? "string")', false);
        });
    });

    // describe("cons", () => {
    //     test("returns false for empty list", () => {
    //         expectBoolean("(pair? (list))", false);
    //     });
    // });

    describe("pair?", () => {
        test("returns false for empty list", () => {
            expectBoolean("(pair? (list))", false);
        });

        test("returns true for non empty list", () => {
            expectBoolean("(pair? (list 1))", true);
            expectBoolean("(pair? (list 1 2))", true);
            expectBoolean("(pair? (list 1 2 3))", true);
        });

        test("returns false for atom", () => {
            expectBoolean("(pair? 1)", false);
            expectBoolean("(pair? #t)", false);
            expectBoolean('(pair? "string")', false);
        });
    });

    describe("length", () => {
        test("return 0 on empty list", () => {
            expectNumber("(length ())", 0);
        });

        test("return 1 on list with single item", () => {
            expectNumber("(length (1))", 1);
        });

        test("return correct list length on list multiple items", () => {
            expectNumber('(length (list 1 "2"))', 2);
        });

        test("return correct list length on nested list", () => {
            expectNumber('(length (list 1 "2" (list 3, (list 4))))', 3);
        });
    });

    describe("car", () => {
        test("return first element of a list", () => {
            expectNumber("(car (1 2 3))", 1);
        });

        test("return null on empty list", () => {
            expectNull("(car ())");
        });

        test("throw error when receiving zero argument", () => {
            expect(() => interpret("(car )")).toThrowError();
        });

        test("throw error when receiving non-list argument", () => {
            expect(() => interpret("(car 1)")).toThrowError();
        });
    });

    describe("crd", () => {
        test("return rest element of a list", () => {
            expectList(
                "(cdr (1 2 3))",
                createList([createNumber(2), createNumber(3)])
            );
        });

        test("return empty listy on empty list", () => {
            expectList("(cdr ())", createList([]));
        });

        test("throw error when receiving zero argument", () => {
            expect(() => interpret("(cdr )")).toThrowError();
        });

        test("throw error when receiving non-list argument", () => {
            expect(() => interpret("(cdr 1)")).toThrowError();
        });
    });
});

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

//     // FIXME: need confirm
//     test("null?", () => {
//         expect(interpret("(null? 1)")).toEqual(false);
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
