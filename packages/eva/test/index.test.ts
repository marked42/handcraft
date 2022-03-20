import { interpret, interpretV2 } from "../src";

describe("should evaluate expressions", () => {
	it("number", () => {
		expect(interpretV2(`1`)).toEqual(1);
	});

	it("string", () => {
		expect(interpretV2(`"hello"`)).toEqual("hello");
	});

	it("boolean", () => {
		expect(interpretV2(`true`)).toEqual(true);
		expect(interpretV2(`false`)).toEqual(false);
	});

	it("arithmetic", () => {
		expect(interpretV2(`(+ 1 2)`)).toEqual(3);
		expect(interpretV2(`(+ (+ 1 2) 3)`)).toEqual(6);
		expect(interpretV2(`(* (+ 1 2) 3)`)).toEqual(9);
	});

	it("comparison", () => {
		expect(interpretV2(`(> 1 2)`)).toBe(false);
		expect(interpretV2(`(>= 1 2)`)).toBe(false);
		expect(interpretV2(`(< 1 2)`)).toBe(true);
		expect(interpretV2(`(<= 1 2)`)).toBe(true);
		expect(interpretV2(`(== 1 2)`)).toBe(false);
		expect(interpretV2(`(!= 1 2)`)).toBe(true);
	});
});

describe("variable", () => {
	it("read global variable", () => {
		expect(interpretV2(`PI`)).toMatchInlineSnapshot(`3.1415926`);
	});

	it("throws when reading non-exist variable", () => {
		expect(() => interpretV2("Math")).toThrowError();
	});

	it("declares a variable", () => {
		expect(interpretV2(`(var a 1)`)).toEqual(1);
		expect(interpretV2(`(var hasMore false)`)).toEqual(false);
	});
});

describe("block", () => {
	it("can declare variable in block", () => {
		expect(
			interpretV2(`(
				begin
				(var x 10)
				(var y 20)
				(+ (* x y) 30)
			)`)
		).toEqual(230);
	});

	it("can read outer variable", () => {
		expect(
			interpretV2(`(
				begin
				(var value 10)
				(var result (begin (var x (+ value 10))))
				result
			)`)
		);
	});

	it("can write outer variable", () => {
		expect(
			interpretV2(`(
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
		interpretV2(`(
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
		interpretV2(`(
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
