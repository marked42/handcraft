import { parseJSON } from "../src";

describe("parseJSON", () => {
	it("should parse null", () => {
		expect(parseJSON("null")).toBe(null);
	});

	it("should parse boolean", () => {
		expect(parseJSON("true")).toBe(true);
		expect(parseJSON("false")).toBe(false);
	});

	it("should ignore whitespace", () => {
		// expect(parseJSON(" true")).toBe(true);
		expect(parseJSON(" null")).toBe(null);
		// expect(parseJSON(" false")).toBe(false);
	});
});

describe("object", () => {
	it("empty object", () => {
		expect(parseJSON("{}")).toEqual({});
	});

	it("object with single value", () => {
		expect(parseJSON('{ "a": null }')).toEqual({ a: null });
	});
});

describe("string", () => {
	it("supports empty string", () => {
		expect(parseJSON('""')).toEqual("");
	});

	it("supports double quote string", () => {
		expect(parseJSON('"a"')).toEqual("a");
	});

	it("support valid single escaped char", () => {
		const pairs = [
			{ literal: String.raw`"\""`, value: '"' },
			{ literal: String.raw`"\\"`, value: "\\" },
			// { literal: String.raw`"\/"`, value: "/" },
			// { literal: String.raw`"\b"`, value: "\b" },
			// { literal: String.raw`"\f"`, value: "\f" },
			// { literal: String.raw`"\n"`, value: "\n" },
			// { literal: String.raw`"\r"`, value: "\r" },
			// { literal: String.raw`"\t"`, value: "\t" },
		];
		pairs.forEach(({ literal, value }) => {
			expect(parseJSON(literal)).toEqual(value);
		});
	});

	it("throw error on invalid escape sequence", () => {
		expect(() => {
			parseJSON('"\\a"');
		}).toThrowError();
	});

	it("throw error on control characters U+0000 ~ U+001F", () => {
		expect(() => {
			parseJSON('"\u0000"');
		}).toThrowError();
	});
});
