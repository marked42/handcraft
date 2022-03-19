import { getStringCodePoints } from "../src/codePoints";

it("getStringCodePoints", () => {
	const input = "null";

	expect(getStringCodePoints(input)).toMatchInlineSnapshot(`
Array [
  110,
  117,
  108,
  108,
]
`);
});
