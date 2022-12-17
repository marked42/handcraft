"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe("should evaluate expressions", function () {
    it("number", function () {
        expect((0, src_1.interpret)("1")).toEqual(1);
    });
    it("string", function () {
        expect((0, src_1.interpret)("\"hello\"")).toEqual("hello");
    });
    it("boolean", function () {
        expect((0, src_1.interpret)("true")).toEqual(true);
        expect((0, src_1.interpret)("false")).toEqual(false);
    });
    it("null", function () {
        expect((0, src_1.interpret)("null")).toEqual(null);
    });
    it("arithmetic", function () {
        expect((0, src_1.interpret)("(+ 1 2)")).toEqual(3);
        expect((0, src_1.interpret)("(+ (+ 1 2) 3)")).toEqual(6);
        expect((0, src_1.interpret)("(* (+ 1 2) 3)")).toEqual(9);
        expect((0, src_1.interpret)("(- 1 2)")).toEqual(-1);
        expect((0, src_1.interpret)("(- 2)")).toEqual(-2);
        expect((0, src_1.interpret)("(+ 2)")).toEqual(2);
    });
    it("comparison", function () {
        expect((0, src_1.interpret)("(> 1 2)")).toBe(false);
        expect((0, src_1.interpret)("(>= 1 2)")).toBe(false);
        expect((0, src_1.interpret)("(< 1 2)")).toBe(true);
        expect((0, src_1.interpret)("(<= 1 2)")).toBe(true);
        expect((0, src_1.interpret)("(== 1 2)")).toBe(false);
        expect((0, src_1.interpret)("(!= 1 2)")).toBe(true);
    });
});
describe("variable", function () {
    it("read global variable", function () {
        expect((0, src_1.interpret)("PI")).toMatchInlineSnapshot("3.1415926");
    });
    it("throws when reading non-exist variable", function () {
        expect(function () { return (0, src_1.interpret)("Math"); }).toThrowError();
    });
    it("declares a variable", function () {
        expect((0, src_1.interpret)("(var a 1)")).toEqual(1);
        expect((0, src_1.interpret)("(var hasMore false)")).toEqual(false);
    });
});
describe("block", function () {
    it("can declare variable in block", function () {
        expect((0, src_1.interpret)("(\n\t\t\t\tbegin\n\t\t\t\t(var x 10)\n\t\t\t\t(var y 20)\n\t\t\t\t(+ (* x y) 30)\n\t\t\t)")).toEqual(230);
    });
    it("can read outer variable", function () {
        expect((0, src_1.interpret)("(\n\t\t\t\tbegin\n\t\t\t\t(var value 10)\n\t\t\t\t(var result (begin (var x (+ value 10))))\n\t\t\t\tresult\n\t\t\t)"));
    });
    it("can write outer variable", function () {
        expect((0, src_1.interpret)("(\n\t\t\t\tbegin\n\t\t\t\t(var value 10)\n\t\t\t\t(begin (set value 100))\n\t\t\t\tvalue\n\t\t\t)")).toEqual(100);
    });
});
it("if expression", function () {
    expect((0, src_1.interpret)("(\n\t\t\tbegin\n\t\t\t(var x 10)\n\t\t\t(var y 0)\n\t\t\t(if (> x 10) (set y 20) (set y 30))\n\t\t\ty\n\t\t)")).toEqual(30);
});
it("while expression", function () {
    expect((0, src_1.interpret)("(\n\t\t\tbegin\n\t\t\t(var counter 0)\n\t\t\t(var result 0)\n\t\t\t(\n\t\t\t\twhile\n\t\t\t\t(< counter 10)\n\t\t\t\t(\n\t\t\t\t\tbegin\n\t\t\t\t\t(set counter (+ counter 1))\n\t\t\t\t\t(set result (+ result 2))\n\t\t\t\t)\n\t\t\t)\n\t\t\tresult\n\t\t)")).toEqual(20);
});
describe("function", function () {
    it("native functions", function () {
        expect((0, src_1.interpret)("(print \"hello world\")")).toEqual(null);
    });
    it("user defined pure function", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(def square (x) (* x x))\n\t\t\t\t(square 2)\n\t\t\t)\n\t\t")).toEqual(4);
    });
    it("function uses outer variable", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(var x 10)\n\t\t\t\t(def foo () x)\n\t\t\t\t(def bar ()\n\t\t\t\t\t(begin\n\t\t\t\t\t\t(var x 20)\n\t\t\t\t\t\t(+ (foo) x)\n\t\t\t\t\t)\n\t\t\t\t)\n\t\t\t\t(bar)\n\t\t\t)\n\t\t")).toEqual(30);
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(def calc (x y) (begin\n\t\t\t\t\t(var z 30)\n\t\t\t\t\t(+ (* x y) z)\n\t\t\t\t))\n\t\t\t\t(calc 10 20)\n\t\t\t)\n\t\t")).toEqual(230);
    });
    it("closure function ", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(var value 100)\n\t\t\t\t(def calc (x y) (begin\n\t\t\t\t\t(var z (+ x y))\n\n\t\t\t\t\t(def inner (foo) (+ (+ foo z) value))\n\n\t\t\t\t\tinner\n\t\t\t\t))\n\t\t\t\t(var fn (calc 10 20))\n\t\t\t\t(fn 30)\n\t\t\t)\n\t\t"));
    });
});
describe("lambda", function () {
    it("should support lambda expression", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(def onClick (callback) (begin\n\t\t\t\t\t(var x 10)\n\t\t\t\t\t(var y 20)\n\t\t\t\t\t(callback (+ x y))\n\t\t\t\t))\n\n\t\t\t\t(onClick (lambda (data) (* data 10)))\n\t\t\t)\n\t\t")).toEqual(300);
    });
    it("immediately invoked lambda expression", function () {
        expect((0, src_1.interpret)("\n\t\t\t((lambda (x) (* x x)) 2)\n\t\t")).toEqual(4);
    });
    it("save lambda function to variable", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(var square (lambda (x) (* x x)))\n\t\t\t\t(square 2)\n\t\t\t)\n\t\t")).toEqual(4);
    });
});
it("switch", function () {
    expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(var x 1)\n\t\t\t(switch ((> x 1) 100) ((== x 1 ) 200) (else 0))\n\t\t)\n\t")).toEqual(200);
});
it("for", function () {
    expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(var counter 0)\n\t\t\t(for (var x 0) (< x 10) (set x (+ x 1)) (set counter (+ counter 2)))\n\t\t\tcounter\n\t\t)\n\t")).toEqual(20);
});
it("increment", function () {
    expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(var x 0)\n\t\t\t(++ x)\n\t\t\tx\n\t\t)\n\t")).toEqual(1);
});
it("decrement", function () {
    expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(var x 0)\n\t\t\t(-- x)\n\t\t\tx\n\t\t)\n\t")).toEqual(-1);
});
it("plus assignment", function () {
    expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(var x 0)\n\t\t\t(+= x 1)\n\t\t\tx\n\t\t)\n\t")).toEqual(1);
});
it("minus assignment", function () {
    expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(var x 0)\n\t\t\t(-= x 1)\n\t\t\tx\n\t\t)\n\t")).toEqual(-1);
});
describe("class", function () {
    it("basic class feature", function () {
        expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(class Point null\n\t\t\t\t(begin\n\t\t\t\t\t(def constructor (this x y)\n\t\t\t\t\t\t(begin\n\t\t\t\t\t\t\t(set (prop this x) x)\n\t\t\t\t\t\t\t(set (prop this y) y)\n\t\t\t\t\t\t))\n\n\t\t\t\t\t(def calc (this)\n\t\t\t\t\t\t(+ (prop this x) (prop this y)))\n\t\t\t\t)\n\t\t\t)\n\t\t\t(var p (new Point 10 20))\n\t\t\t((prop p calc) p)\n\t\t)\n\t")).toEqual(30);
    });
    it("super class", function () {
        expect((0, src_1.interpret)("\n\t\t(begin\n\t\t\t(class Point null\n\t\t\t\t(begin\n\t\t\t\t\t(def constructor (this x y)\n\t\t\t\t\t\t(begin\n\t\t\t\t\t\t\t(set (prop this x) x)\n\t\t\t\t\t\t\t(set (prop this y) y)\n\t\t\t\t\t\t))\n\n\t\t\t\t\t(def calc (this)\n\t\t\t\t\t\t(+ (prop this x) (prop this y)))\n\t\t\t\t)\n\t\t\t)\n\n\t\t\t(class Point3D Point\n\t\t\t\t(begin\n\t\t\t\t\t(def constructor (this x y z)\n\t\t\t\t\t\t(begin\n\t\t\t\t\t\t\t((prop (super Point3D) constructor) this x y)\n\t\t\t\t\t\t\t(set (prop this z) z)\n\t\t\t\t\t\t)\n\t\t\t\t\t)\n\t\t\t\t\t(def calc (this)\n\t\t\t\t\t\t(+ ((prop (super Point3D) calc) this) (prop this z))\n\t\t\t\t\t)\n\t\t\t\t)\n\t\t\t)\n\t\t\t(var p (new Point3D 10 20 30))\n\t\t\t((prop p calc) p)\n\t\t)\n\t")).toEqual(60);
    });
});
describe("module", function () {
    it("definition", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(module Math\n\t\t\t\t\t(begin\n\t\t\t\t\t\t(def abs (value)\n\t\t\t\t\t\t\t(if (< value 0) (- value) value)\n\t\t\t\t\t\t)\n\t\t\t\t\t\t(def square (x) (* x x))\n\t\t\t\t\t\t(var MAX_VALUE 1000)\n\t\t\t\t\t)\n\t\t\t\t)\n\t\t\t\t((prop Math abs) (- 10))\n\n\t\t\t\t(var abs (prop Math abs))\n\t\t\t\t(abs (- 10))\n\t\t\t)\n\t\t")).toEqual(10);
    });
    it("module property read", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(module Math\n\t\t\t\t\t(begin\n\t\t\t\t\t\t(def abs (value)\n\t\t\t\t\t\t\t(if (< value 0) (- value) value)\n\t\t\t\t\t\t)\n\t\t\t\t\t\t(def square (x) (* x x))\n\t\t\t\t\t\t(var MAX_VALUE 1000)\n\t\t\t\t\t)\n\t\t\t\t)\n\t\t\t\t((prop Math abs) (- 10))\n\t\t\t)\n\t\t")).toEqual(10);
    });
    it("module property read and save", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(module Math\n\t\t\t\t\t(begin\n\t\t\t\t\t\t(def abs (value)\n\t\t\t\t\t\t\t(if (< value 0) (- value) value)\n\t\t\t\t\t\t)\n\t\t\t\t\t\t(def square (x) (* x x))\n\t\t\t\t\t\t(var MAX_VALUE 1000)\n\t\t\t\t\t)\n\t\t\t\t)\n\t\t\t\t(var abs (prop Math abs))\n\t\t\t\t(abs (- 10))\n\t\t\t)\n\t\t")).toEqual(10);
    });
    it("import external module", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(import Math)\n\t\t\t\t(var abs (prop Math abs))\n\t\t\t\t(abs (- 10))\n\t\t\t)\n\t\t", __dirname)).toEqual(10);
    });
    it("named import external module", function () {
        expect((0, src_1.interpret)("\n\t\t\t(begin\n\t\t\t\t(import Math abs)\n\t\t\t\t(abs (- 10))\n\t\t\t)\n\t\t", __dirname)).toEqual(10);
    });
});
//# sourceMappingURL=index.test.js.map