import { Eva } from "./Eva";
import { Expression } from "./expression";
/* eslint-disable-next-line */
const EvaParser = require("./parser");

export function interpret(source: string, moduleFolder?: string) {
	const eva = new Eva();
	if (moduleFolder) {
		eva.setModuleFolder(moduleFolder);
	}

	const expr = EvaParser.parse(source) as Expression;

	return eva.eval(expr);
}
