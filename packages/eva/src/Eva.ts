import { Expression } from "./expression";

export class Eva {
	eval(expr: Expression): string | number {
		if (this.isNumberExpression(expr)) {
			return this.evalNumber(expr);
		}

		if (this.isStringExpression(expr)) {
			return this.evalString(expr);
		}

		if (Array.isArray(expr) && expr[0] === "+") {
			const [, left, right] = expr;

			const leftNumber = this.eval(left);
			const rightNumber = this.eval(right);

			this.assertNumberExpression(leftNumber);
			this.assertNumberExpression(rightNumber);

			return leftNumber + rightNumber;
		}

		throw "Unimplemented";
	}

	evalString(expr: string) {
		this.assertStringExpression(expr);
		return expr.slice(1, -1);
	}

	evalNumber(expr: number) {
		this.assertNumberExpression(expr);
		return expr;
	}

	isStringExpression(expr: Expression): expr is string {
		return (
			typeof expr === "string" &&
			expr[0] === '"' &&
			expr.slice(-1) === '"'
		);
	}

	assertStringExpression(expr: Expression): asserts expr is string {
		if (!this.isStringExpression(expr)) {
			throw new Error(`表达式${JSON.stringify(expr)}的参数必须是字符串`);
		}
	}

	isNumberExpression(expr: Expression): expr is number {
		return typeof expr === "number";
	}

	assertNumberExpression(expr: Expression): asserts expr is number {
		if (!this.isNumberExpression(expr)) {
			throw new Error(`表达式${JSON.stringify(expr)}的参数必须是数字`);
		}
	}
}
