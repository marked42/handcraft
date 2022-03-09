import { parseJSON } from "../src";

describe("parseJSON", () => {
	it("should parse empty object", () => {
		const input = "{}";
		const result = parseJSON(input);

		expect(result).toEqual({});
	});
});
