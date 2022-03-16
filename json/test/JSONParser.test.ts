import { parseJSON } from "../src";

describe("null", () => {
	it("should parse null", () => {
		expect(parseJSON("null")).toBe(null);
	});
});

describe("boolean", () => {
	it("should parse boolean", () => {
		expect(parseJSON("true")).toBe(true);
		expect(parseJSON("false")).toBe(false);
	});
});

describe("whitespace", () => {
	it("should ignore whitespace", () => {
		expect(parseJSON(" true")).toBe(true);
		expect(parseJSON(" null")).toBe(null);
		expect(parseJSON(" false")).toBe(false);
	});
});

describe("number", () => {
	it("zero", () => {
		expect(parseJSON("0")).toBe(0);
	});

	it("non zero integer", () => {
		expect(parseJSON("1")).toBe(1);
		expect(parseJSON("10")).toBe(10);
		expect(parseJSON("12347883")).toBe(12347883);
	});

	it("error on invalid leading zero", () => {
		expect(() => {
			parseJSON("00");
		}).toThrowError();

		expect(() => {
			parseJSON("01");
		}).toThrowError();
	});

	// TODO: how to describe intention of a test
	// TODO: test coverage
	it("float", () => {
		expect(parseJSON("1.0")).toBe(1.0);
		expect(parseJSON("0.0")).toBe(0.0);
	});

	it("error on invalid float", () => {
		expect(() => {
			parseJSON("1.e");
		}).toThrowError();
	});

	it("exponent", () => {
		expect(parseJSON("1.0e1")).toBe(1.0e1);
		expect(parseJSON("1.0e-1")).toBe(1.0e-1);
		expect(parseJSON("1.0e+1")).toBe(1.0e1);
		expect(parseJSON("1.0E1")).toBe(1.0e1);
		expect(parseJSON("1.0E-1")).toBe(1.0e-1);
		expect(parseJSON("1.0E+1")).toBe(1.0e1);
	});

	it("error on invalid exponent", () => {
		expect(() => {
			expect(parseJSON("1.0e"));
		}).toThrowError();
		expect(() => {
			expect(parseJSON("1.0e+"));
		}).toThrowError();
		expect(() => {
			expect(parseJSON("1.0e-"));
		}).toThrowError();
		expect(() => {
			expect(parseJSON("1.0f"));
		}).toThrowError();
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

	it("supports unicode escape sequence with no character assignment", () => {
		expect(parseJSON('"\\uD800"')).toEqual("\uD800");
	});

	it("throw error on invalid unicode escape sequence", () => {
		expect(() => {
			parseJSON('"\\u000g"');
		}).toThrowError();

		expect(() => {
			parseJSON('"\\u000"');
		}).toThrowError();
	});

	it("unicode surrogate pair", () => {
		expect(parseJSON('"\\uD834\\uDD1E"')).toEqual("𝄞");
	});
});

describe("object", () => {
	it("empty object", () => {
		expect(parseJSON("{}")).toEqual({});
	});

	it("object with single value", () => {
		expect(parseJSON('{ "a": null }')).toEqual({ a: null });
	});

	it("object with multiple values", () => {
		expect(parseJSON('{ "a": null, "b": "test" }')).toEqual({
			a: null,
			b: "test",
		});
	});
});

describe("array", () => {
	it("empty array", () => {
		expect(parseJSON("[]")).toEqual([]);
	});

	it("array with single value", () => {
		expect(parseJSON("[ null ]")).toEqual([null]);
	});

	it("array with multiple values", () => {
		expect(parseJSON('[ null, "test" ]')).toEqual([null, "test"]);
	});

	it("throw error on invalid patterns", () => {
		expect(() => {
			parseJSON("[,]");
		}).toThrowError();

		expect(() => {
			parseJSON("[null,]");
		}).toThrowError();

		expect(() => {
			parseJSON("[null,,]");
		}).toThrowError();
	});
});
