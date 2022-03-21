import { CompoundExpression } from "./expression";

export class JITTransformer {
	transformFunctionDeclaration(expr: CompoundExpression) {
		const [, fnName, parameters, body] = expr;

		// this.assertsSymbol(fnName);
		// this.assertsSymbolArray(parameters);

		// JIT transpile function declaration to variable declaration
		const variableDeclaration = [
			"var",
			fnName,
			["lambda", parameters, body],
		];

		return variableDeclaration;
	}
}
