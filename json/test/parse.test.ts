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

	it("supports characters excluding control characters, new line and double quote", () => {
		expect(parseJSON('"a"')).toEqual("a");
		expect(parseJSON('"\u0020"')).toEqual("\u0020");
	});

	it("throw error when containing control characters U+0000 ~ U+001F", () => {
		expect(() => {
			parseJSON('"\u0000"');
		}).toThrowError();

		expect(() => {
			parseJSON('"\u001F"');
		}).toThrowError();
	});

	it("throw error when containing newline", () => {
		expect(() => {
			parseJSON('"\n"');
		}).toThrowError();
	});

	it("support valid single character escape sequence", () => {
		const pairs = [
			{ literal: String.raw`"\""`, value: '"' },
			{ literal: String.raw`"\\"`, value: "\\" },
			{ literal: String.raw`"\/"`, value: "/" },
			{ literal: String.raw`"\b"`, value: "\b" },
			{ literal: String.raw`"\f"`, value: "\f" },
			{ literal: String.raw`"\n"`, value: "\n" },
			{ literal: String.raw`"\r"`, value: "\r" },
			{ literal: String.raw`"\t"`, value: "\t" },
		];
		pairs.forEach(({ literal, value }) => {
			expect(parseJSON(literal)).toEqual(value);
		});
	});

	it("throw error on invalid single character escape sequence", () => {
		expect(() => {
			parseJSON('"\\a"');
		}).toThrowError();
	});

	it("supports unicode escape sequence", () => {
		expect(parseJSON('"\\u0020"')).toEqual("\u0020");
		expect(parseJSON('"\\u0020f"')).toEqual("\u0020f");
		expect(parseJSON('"\\uFFFF"')).toEqual("\uFFFF");
	});

	it("throw error on invalid unicode escape sequence", () => {
		expect(() => {
			parseJSON('"\\u000g"');
		}).toThrowError();

		expect(() => {
			parseJSON('"\\u000"');
		}).toThrowError();
	});

	it.todo("unicode surrogate pair");
});
