import { interpret } from "../src";

describe("should evaluate expressions", () => {
	it("number", () => {
		expect(interpret(1)).toEqual(1);
	});

	it("string", () => {
		expect(interpret('"hello"')).toEqual("hello");
	});

	it("+", () => {
		expect(interpret(["+", 1, 2])).toEqual(3);
		expect(interpret(["+", ["+", 1, 2], 3])).toEqual(6);
	});
});
