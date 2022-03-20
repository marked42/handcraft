import { interpret } from "../src";

describe("should evaluate expressions", () => {
	it("number", () => {
		expect(interpret(1)).toEqual(1);
	});

	it("string", () => {
		expect(interpret('"hello"')).toEqual("hello");
	});

	it("boolean", () => {
		expect(interpret(true)).toEqual(true);
		expect(interpret(false)).toEqual(false);
	});

	it("arithmetic", () => {
		expect(interpret(["+", 1, 2])).toEqual(3);
		expect(interpret(["+", ["+", 1, 2], 3])).toEqual(6);
		expect(interpret(["*", ["+", 1, 2], 3])).toEqual(9);
	});
});

describe("variable", () => {
	it("read global variable", () => {
		expect(interpret("PI")).toMatchInlineSnapshot(`3.1415926`);
	});

	it("throws when reading non-exist variable", () => {
		expect(() => interpret("Math")).toThrowError();
	});

	it("declares a variable", () => {
		expect(interpret(["var", "a", 1])).toEqual(1);
		expect(interpret(["var", "hasMore", false])).toEqual(false);
	});
});

describe("block", () => {
	it("can declare variable in block", () => {
		expect(
			interpret([
				"begin",
				["var", "x", 10],
				["var", "y", 20],
				["+", ["*", "x", "y"], 30],
			])
		).toEqual(230);
	});

	it("can read outer variable", () => {
		expect(
			interpret([
				"begin",
				["var", "value", 10],
				["var", "result", ["begin", ["var", "x", ["+", "value", 10]]]],
				"result",
			])
		);
	});

	it("can write outer variable", () => {
		expect(
			interpret([
				"begin",
				["var", "value", 10],
				["begin", ["set", "value", 100]],
				"value",
			])
		).toEqual(100);
	});
});
