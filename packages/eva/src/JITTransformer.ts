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

	transformSwitchCase(expr: CompoundExpression) {
		const [, ...cases] = expr;

		const ifExpr: CompoundExpression = ["if"];

		let current = ifExpr;
		for (let i = 0; i < cases.length - 1; i++) {
			const c = cases[i];

			if (!Array.isArray(c)) {
				throw new Error(
					`invalid switch case ${JSON.stringify(
						c
					)}, must not be atomic value`
				);
			}

			const [condition, value] = c;

			current[1] = condition;
			current[2] = value;

			const next = cases[i + 1];
			if (!Array.isArray(next)) {
				throw new Error(
					`invalid switch case ${JSON.stringify(
						c
					)}, must not be atomic value`
				);
			}
			const [nextCondition, nextValue] = next;
			if (nextCondition === "else") {
				current[3] = nextValue;
			} else {
				const ifExpr: CompoundExpression = ["if"];
				current[3] = ifExpr;
				current = ifExpr;
			}
		}

		return ifExpr;
	}
}
