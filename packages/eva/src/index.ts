import { Eva } from "./Eva";
import { Expression } from "./expression";

export function interpret(expr: Expression) {
	const eva = new Eva();

	return eva.eval(expr);
}
