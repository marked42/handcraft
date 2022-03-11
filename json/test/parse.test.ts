import { parseJSON } from "../src";

describe("parseJSON", () => {
	it("should parse empty object", () => {
		expect(parseJSON("{}")).toEqual({});
	});

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

	it("handles other escapes", () => {
		expect(parseJSON('"\\a"')).toEqual("a");
	});
});
