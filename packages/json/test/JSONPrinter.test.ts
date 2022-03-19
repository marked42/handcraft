import { printJSON } from "../src";

it("should print null", () => {
	expect(printJSON(null)).toEqual("null");
});

it("should print boolean", () => {
	expect(printJSON(true)).toEqual("true");
	expect(printJSON(false)).toEqual("false");
});

it("should print string", () => {
	expect(printJSON("")).toEqual('""');
	expect(printJSON("abc")).toEqual('"abc"');
});

it("should print number", () => {
	expect(printJSON(0)).toEqual("0");
	expect(printJSON(0.0)).toEqual("0");
	expect(printJSON(1)).toEqual("1");
	expect(printJSON(-1)).toEqual("-1");
	expect(printJSON(2.33e2)).toEqual("233");
});

it("should print array", () => {
	expect(printJSON([])).toEqual("[]");
	expect(printJSON([1, null, "a", true])).toEqual('[1, null, "a", true]');
	expect(printJSON([[1], "a", { b: true }])).toEqual(
		'[[1], "a", {"b": true}]'
	);
});

it("should print object", () => {
	expect(printJSON({})).toEqual("{}");
	expect(printJSON({ a: 1 })).toEqual('{"a": 1}');
	expect(printJSON({ a: 1, b: null, c: { d: [true] } })).toEqual(
		'{"a": 1, "b": null, "c": {"d": [true]}}'
	);
});
