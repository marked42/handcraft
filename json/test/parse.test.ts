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
});
