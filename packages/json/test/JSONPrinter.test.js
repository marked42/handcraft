"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
it("should print null", function () {
    expect((0, src_1.printJSON)(null)).toEqual("null");
});
it("should print boolean", function () {
    expect((0, src_1.printJSON)(true)).toEqual("true");
    expect((0, src_1.printJSON)(false)).toEqual("false");
});
it("should print string", function () {
    expect((0, src_1.printJSON)("")).toEqual('""');
    expect((0, src_1.printJSON)("abc")).toEqual('"abc"');
});
it("should print number", function () {
    expect((0, src_1.printJSON)(0)).toEqual("0");
    expect((0, src_1.printJSON)(0.0)).toEqual("0");
    expect((0, src_1.printJSON)(1)).toEqual("1");
    expect((0, src_1.printJSON)(-1)).toEqual("-1");
    expect((0, src_1.printJSON)(2.33e2)).toEqual("233");
});
it("should print array", function () {
    expect((0, src_1.printJSON)([])).toEqual("[]");
    expect((0, src_1.printJSON)([1, null, "a", true])).toEqual('[1, null, "a", true]');
    expect((0, src_1.printJSON)([[1], "a", { b: true }])).toEqual('[[1], "a", {"b": true}]');
});
it("should print object", function () {
    expect((0, src_1.printJSON)({})).toEqual("{}");
    expect((0, src_1.printJSON)({ a: 1 })).toEqual('{"a": 1}');
    expect((0, src_1.printJSON)({ a: 1, b: null, c: { d: [true] } })).toEqual('{"a": 1, "b": null, "c": {"d": [true]}}');
});
//# sourceMappingURL=JSONPrinter.test.js.map