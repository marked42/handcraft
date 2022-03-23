import { Eva } from "./Eva";
import { Expression } from "./expression";
import { EvaParser } from "./parser";

export function interpret(source: string, moduleFolder?: string) {
	const eva = new Eva();
	if (moduleFolder) {
		eva.setModuleFolder(moduleFolder);
	}

	const wrapInBlock = `(begin ${source})`;
	const expr = EvaParser.parse(wrapInBlock) as Expression;

	const value = eva.eval(expr);
	return value;
}
