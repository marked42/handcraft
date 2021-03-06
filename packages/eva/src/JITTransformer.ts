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

	transformForToWhile(expr: CompoundExpression) {
		const [, initializer, condition, modifier, body] = expr;

		const whileExpr = [
			"begin",
			initializer,
			["while", condition, ["begin", body, modifier]],
		];

		return whileExpr;
	}

	transformIncrement(expr: CompoundExpression) {
		const [, symbol] = expr;

		return ["set", symbol, ["+", symbol, 1]];
	}

	transformDecrement(expr: CompoundExpression) {
		const [, symbol] = expr;

		return ["set", symbol, ["-", symbol, 1]];
	}

	transformPlusAssignment(expr: CompoundExpression) {
		const [, symbol, step] = expr;

		return ["set", symbol, ["+", symbol, step]];
	}

	transformMinusAssignment(expr: CompoundExpression) {
		const [, symbol, step] = expr;

		return ["set", symbol, ["-", symbol, step]];
	}
}
