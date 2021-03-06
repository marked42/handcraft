import { interpret } from "../src";

describe("should evaluate expressions", () => {
	it("number", () => {
		expect(interpret(`1`)).toEqual(1);
	});

	it("string", () => {
		expect(interpret(`"hello"`)).toEqual("hello");
	});

	it("boolean", () => {
		expect(interpret(`true`)).toEqual(true);
		expect(interpret(`false`)).toEqual(false);
	});

	it("null", () => {
		expect(interpret(`null`)).toEqual(null);
	});

	it("arithmetic", () => {
		expect(interpret(`(+ 1 2)`)).toEqual(3);
		expect(interpret(`(+ (+ 1 2) 3)`)).toEqual(6);
		expect(interpret(`(* (+ 1 2) 3)`)).toEqual(9);
		expect(interpret(`(- 1 2)`)).toEqual(-1);
		expect(interpret(`(- 2)`)).toEqual(-2);
		expect(interpret(`(+ 2)`)).toEqual(2);
	});

	it("comparison", () => {
		expect(interpret(`(> 1 2)`)).toBe(false);
		expect(interpret(`(>= 1 2)`)).toBe(false);
		expect(interpret(`(< 1 2)`)).toBe(true);
		expect(interpret(`(<= 1 2)`)).toBe(true);
		expect(interpret(`(== 1 2)`)).toBe(false);
		expect(interpret(`(!= 1 2)`)).toBe(true);
	});
});

describe("variable", () => {
	it("read global variable", () => {
		expect(interpret(`PI`)).toMatchInlineSnapshot(`3.1415926`);
	});

	it("throws when reading non-exist variable", () => {
		expect(() => interpret("Math")).toThrowError();
	});

	it("declares a variable", () => {
		expect(interpret(`(var a 1)`)).toEqual(1);
		expect(interpret(`(var hasMore false)`)).toEqual(false);
	});
});

describe("block", () => {
	it("can declare variable in block", () => {
		expect(
			interpret(`(
				begin
				(var x 10)
				(var y 20)
				(+ (* x y) 30)
			)`)
		).toEqual(230);
	});

	it("can read outer variable", () => {
		expect(
			interpret(`(
				begin
				(var value 10)
				(var result (begin (var x (+ value 10))))
				result
			)`)
		);
	});

	it("can write outer variable", () => {
		expect(
			interpret(`(
				begin
				(var value 10)
				(begin (set value 100))
				value
			)`)
		).toEqual(100);
	});
});

it("if expression", () => {
	expect(
		interpret(`(
			begin
			(var x 10)
			(var y 0)
			(if (> x 10) (set y 20) (set y 30))
			y
		)`)
	).toEqual(30);
});

it("while expression", () => {
	expect(
		interpret(`(
			begin
			(var counter 0)
			(var result 0)
			(
				while
				(< counter 10)
				(
					begin
					(set counter (+ counter 1))
					(set result (+ result 2))
				)
			)
			result
		)`)
	).toEqual(20);
});

describe("function", () => {
	it("native functions", () => {
		expect(interpret(`(print "hello world")`)).toEqual(null);
	});

	it("user defined pure function", () => {
		expect(
			interpret(`
			(begin
				(def square (x) (* x x))
				(square 2)
			)
		`)
		).toEqual(4);
	});

	it("function uses outer variable", () => {
		expect(
			interpret(`
			(begin
				(var x 10)
				(def foo () x)
				(def bar ()
					(begin
						(var x 20)
						(+ (foo) x)
					)
				)
				(bar)
			)
		`)
		).toEqual(30);

		expect(
			interpret(`
			(begin
				(def calc (x y) (begin
					(var z 30)
					(+ (* x y) z)
				))
				(calc 10 20)
			)
		`)
		).toEqual(230);
	});

	it("closure function ", () => {
		expect(
			interpret(`
			(begin
				(var value 100)
				(def calc (x y) (begin
					(var z (+ x y))

					(def inner (foo) (+ (+ foo z) value))

					inner
				))
				(var fn (calc 10 20))
				(fn 30)
			)
		`)
		);
	});
});

describe("lambda", () => {
	it("should support lambda expression", () => {
		expect(
			interpret(`
			(begin
				(def onClick (callback) (begin
					(var x 10)
					(var y 20)
					(callback (+ x y))
				))

				(onClick (lambda (data) (* data 10)))
			)
		`)
		).toEqual(300);
	});

	it("immediately invoked lambda expression", () => {
		expect(
			interpret(`
			((lambda (x) (* x x)) 2)
		`)
		).toEqual(4);
	});

	it("save lambda function to variable", () => {
		expect(
			interpret(`
			(begin
				(var square (lambda (x) (* x x)))
				(square 2)
			)
		`)
		).toEqual(4);
	});
});

it("switch", () => {
	expect(
		interpret(`
		(begin
			(var x 1)
			(switch ((> x 1) 100) ((== x 1 ) 200) (else 0))
		)
	`)
	).toEqual(200);
});

it("for", () => {
	expect(
		interpret(`
		(begin
			(var counter 0)
			(for (var x 0) (< x 10) (set x (+ x 1)) (set counter (+ counter 2)))
			counter
		)
	`)
	).toEqual(20);
});

it("increment", () => {
	expect(
		interpret(`
		(begin
			(var x 0)
			(++ x)
			x
		)
	`)
	).toEqual(1);
});

it("decrement", () => {
	expect(
		interpret(`
		(begin
			(var x 0)
			(-- x)
			x
		)
	`)
	).toEqual(-1);
});

it("plus assignment", () => {
	expect(
		interpret(`
		(begin
			(var x 0)
			(+= x 1)
			x
		)
	`)
	).toEqual(1);
});

it("minus assignment", () => {
	expect(
		interpret(`
		(begin
			(var x 0)
			(-= x 1)
			x
		)
	`)
	).toEqual(-1);
});

describe("class", () => {
	it("basic class feature", () => {
		expect(
			interpret(`
		(begin
			(class Point null
				(begin
					(def constructor (this x y)
						(begin
							(set (prop this x) x)
							(set (prop this y) y)
						))

					(def calc (this)
						(+ (prop this x) (prop this y)))
				)
			)
			(var p (new Point 10 20))
			((prop p calc) p)
		)
	`)
		).toEqual(30);
	});

	it("super class", () => {
		expect(
			interpret(`
		(begin
			(class Point null
				(begin
					(def constructor (this x y)
						(begin
							(set (prop this x) x)
							(set (prop this y) y)
						))

					(def calc (this)
						(+ (prop this x) (prop this y)))
				)
			)

			(class Point3D Point
				(begin
					(def constructor (this x y z)
						(begin
							((prop (super Point3D) constructor) this x y)
							(set (prop this z) z)
						)
					)
					(def calc (this)
						(+ ((prop (super Point3D) calc) this) (prop this z))
					)
				)
			)
			(var p (new Point3D 10 20 30))
			((prop p calc) p)
		)
	`)
		).toEqual(60);
	});
});

describe("module", () => {
	it("definition", () => {
		expect(
			interpret(`
			(begin
				(module Math
					(begin
						(def abs (value)
							(if (< value 0) (- value) value)
						)
						(def square (x) (* x x))
						(var MAX_VALUE 1000)
					)
				)
				((prop Math abs) (- 10))

				(var abs (prop Math abs))
				(abs (- 10))
			)
		`)
		).toEqual(10);
	});

	it("module property read", () => {
		expect(
			interpret(`
			(begin
				(module Math
					(begin
						(def abs (value)
							(if (< value 0) (- value) value)
						)
						(def square (x) (* x x))
						(var MAX_VALUE 1000)
					)
				)
				((prop Math abs) (- 10))
			)
		`)
		).toEqual(10);
	});

	it("module property read and save", () => {
		expect(
			interpret(`
			(begin
				(module Math
					(begin
						(def abs (value)
							(if (< value 0) (- value) value)
						)
						(def square (x) (* x x))
						(var MAX_VALUE 1000)
					)
				)
				(var abs (prop Math abs))
				(abs (- 10))
			)
		`)
		).toEqual(10);
	});

	it("import external module", () => {
		expect(
			interpret(
				`
			(begin
				(import Math)
				(var abs (prop Math abs))
				(abs (- 10))
			)
		`,
				__dirname
			)
		).toEqual(10);
	});

	it("named import external module", () => {
		expect(
			interpret(
				`
			(begin
				(import Math abs)
				(abs (- 10))
			)
		`,
				__dirname
			)
		).toEqual(10);
	});
});
