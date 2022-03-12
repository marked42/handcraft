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
		expect(parseJSON(" true")).toBe(true);
		expect(parseJSON(" null")).toBe(null);
		expect(parseJSON(" false")).toBe(false);
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

	it("supports escaped quote", () => {
		expect(parseJSON('"\\""')).toEqual('"');
	});

	it("support escaped new line", () => {
		expect(parseJSON('"\\n"')).toEqual("\n");
	});

	it("throw error on invalid escape sequence", () => {
		expect(() => {
			parseJSON('"\\a"');
		}).toThrowError();
	});
});
