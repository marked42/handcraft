import { interpret } from "../src";

describe("should evaluate expressions", () => {
	it("number", () => {
		expect(interpret(1)).toEqual(1);
	});

	it("string", () => {
		expect(interpret('"hello"')).toEqual("hello");
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

	it("declares a variable", () => {
		expect(interpret(["var", "a", 1])).toEqual(1);
	});
});
