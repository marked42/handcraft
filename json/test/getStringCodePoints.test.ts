import { getStringCodePoints } from "../src/getStringCodePoints";

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
