"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe("null", function () {
    it("should parse null", function () {
        expect((0, src_1.parseJSON)("null")).toBe(null);
    });
});
describe("boolean", function () {
    it("should parse boolean", function () {
        expect((0, src_1.parseJSON)("true")).toBe(true);
        expect((0, src_1.parseJSON)("false")).toBe(false);
    });
});
describe("whitespace", function () {
    it("should ignore whitespace", function () {
        expect((0, src_1.parseJSON)(" true")).toBe(true);
        expect((0, src_1.parseJSON)(" null")).toBe(null);
        expect((0, src_1.parseJSON)(" false")).toBe(false);
    });
});
describe("number", function () {
    it("zero", function () {
        expect((0, src_1.parseJSON)("0")).toBe(0);
    });
    it("non zero integer", function () {
        expect((0, src_1.parseJSON)("1")).toBe(1);
        expect((0, src_1.parseJSON)("10")).toBe(10);
        expect((0, src_1.parseJSON)("12347883")).toBe(12347883);
    });
    it("error on invalid leading zero", function () {
        expect(function () {
            (0, src_1.parseJSON)("00");
        }).toThrowError();
        expect(function () {
            (0, src_1.parseJSON)("01");
        }).toThrowError();
    });
    it("float", function () {
        expect((0, src_1.parseJSON)("1.0")).toBe(1.0);
        expect((0, src_1.parseJSON)("0.0")).toBe(0.0);
    });
    it("error on invalid float", function () {
        expect(function () {
            (0, src_1.parseJSON)("1.e");
        }).toThrowError();
    });
    it("exponent", function () {
        expect((0, src_1.parseJSON)("1.0e1")).toBe(1.0e1);
        expect((0, src_1.parseJSON)("1.0e-1")).toBe(1.0e-1);
        expect((0, src_1.parseJSON)("1.0e+1")).toBe(1.0e1);
        expect((0, src_1.parseJSON)("1.0E1")).toBe(1.0e1);
        expect((0, src_1.parseJSON)("1.0E-1")).toBe(1.0e-1);
        expect((0, src_1.parseJSON)("1.0E+1")).toBe(1.0e1);
    });
    it("error on invalid exponent", function () {
        expect(function () {
            expect((0, src_1.parseJSON)("1.0e"));
        }).toThrowError();
        expect(function () {
            expect((0, src_1.parseJSON)("1.0e+"));
        }).toThrowError();
        expect(function () {
            expect((0, src_1.parseJSON)("1.0e-"));
        }).toThrowError();
        expect(function () {
            expect((0, src_1.parseJSON)("1.0f"));
        }).toThrowError();
    });
});
describe("string", function () {
    it("supports empty string", function () {
        expect((0, src_1.parseJSON)('""')).toEqual("");
    });
    it("supports characters excluding control characters, new line and double quote", function () {
        expect((0, src_1.parseJSON)('"a"')).toEqual("a");
        expect((0, src_1.parseJSON)('"\u0020"')).toEqual("\u0020");
    });
    it("throw error when containing control characters U+0000 ~ U+001F", function () {
        expect(function () {
            (0, src_1.parseJSON)('"\u0000"');
        }).toThrowError();
        expect(function () {
            (0, src_1.parseJSON)('"\u001F"');
        }).toThrowError();
    });
    it("throw error when containing newline", function () {
        expect(function () {
            (0, src_1.parseJSON)('"\n"');
        }).toThrowError();
    });
    it("support valid single character escape sequence", function () {
        var pairs = [
            { literal: String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\"\"\""], ["\"\\\"\""]))), value: '"' },
            { literal: String.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\"\\\""], ["\"\\\\\""]))), value: "\\" },
            { literal: String.raw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\"/\""], ["\"\\/\""]))), value: "/" },
            { literal: String.raw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\"\b\""], ["\"\\b\""]))), value: "\b" },
            { literal: String.raw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\"\f\""], ["\"\\f\""]))), value: "\f" },
            { literal: String.raw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\"\n\""], ["\"\\n\""]))), value: "\n" },
            { literal: String.raw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\"\r\""], ["\"\\r\""]))), value: "\r" },
            { literal: String.raw(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\"\t\""], ["\"\\t\""]))), value: "\t" },
        ];
        pairs.forEach(function (_a) {
            var literal = _a.literal, value = _a.value;
            expect((0, src_1.parseJSON)(literal)).toEqual(value);
        });
    });
    it("throw error on invalid single character escape sequence", function () {
        expect(function () {
            (0, src_1.parseJSON)('"\\a"');
        }).toThrowError();
    });
    it("supports unicode escape sequence", function () {
        expect((0, src_1.parseJSON)('"\\u0020"')).toEqual("\u0020");
        expect((0, src_1.parseJSON)('"\\u0020f"')).toEqual("\u0020f");
        expect((0, src_1.parseJSON)('"\\uFFFF"')).toEqual("\uFFFF");
    });
    it("supports unicode escape sequence with no character assignment", function () {
        expect((0, src_1.parseJSON)('"\\uD800"')).toEqual("\uD800");
    });
    it("throw error on invalid unicode escape sequence", function () {
        expect(function () {
            (0, src_1.parseJSON)('"\\u000g"');
        }).toThrowError();
        expect(function () {
            (0, src_1.parseJSON)('"\\u000"');
        }).toThrowError();
    });
    it("unicode surrogate pair", function () {
        expect((0, src_1.parseJSON)('"\\uD834\\uDD1E"')).toEqual("𝄞");
    });
});
describe("object", function () {
    it("empty object", function () {
        expect((0, src_1.parseJSON)("{}")).toEqual({});
    });
    it("object with single value", function () {
        expect((0, src_1.parseJSON)('{ "a": null }')).toEqual({ a: null });
    });
    it("object with multiple values", function () {
        expect((0, src_1.parseJSON)('{ "a": null, "b": "test" }')).toEqual({
            a: null,
            b: "test",
        });
    });
});
describe("array", function () {
    it("empty array", function () {
        expect((0, src_1.parseJSON)("[]")).toEqual([]);
    });
    it("array with single value", function () {
        expect((0, src_1.parseJSON)("[ null ]")).toEqual([null]);
    });
    it("array with multiple values", function () {
        expect((0, src_1.parseJSON)('[ null, "test" ]')).toEqual([null, "test"]);
    });
    it("throw error on invalid patterns", function () {
        expect(function () {
            (0, src_1.parseJSON)("[,]");
        }).toThrowError();
        expect(function () {
            (0, src_1.parseJSON)("[null,]");
        }).toThrowError();
        expect(function () {
            (0, src_1.parseJSON)("[null,,]");
        }).toThrowError();
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
//# sourceMappingURL=JSONParser.test.js.map