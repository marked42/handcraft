import { Eva } from "./Eva";
import { Expression } from "./expression";
/* eslint-disable-next-line */
const EvaParser = require("./parser");

export function interpret(source: string) {
	const eva = new Eva();

	const expr = EvaParser.parse(source) as Expression;

	return eva.eval(expr);
}
