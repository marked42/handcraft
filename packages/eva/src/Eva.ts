import { Environment } from "./Environment";
import {
	BooleanExpression,
	CompoundExpression,
	Expression,
	ExpressionValue,
} from "./expression";

export class Eva {
	constructor(
		private readonly globalEnvironment = Environment.createGlobalEnvironment()
	) {}

	eval(expr: Expression) {
		return this.evalInEnvironment(expr, this.globalEnvironment);
	}

	evalInEnvironment(
		expr: Expression,
		environment: Environment
	): ExpressionValue {
		if (this.isNumberExpression(expr)) {
			return this.evalNumber(expr);
		}

		if (this.isBooleanExpression(expr)) {
			return this.evalBoolean(expr);
		}

		if (this.isStringExpression(expr)) {
			return this.evalString(expr);
		}

		if (this.isVariableName(expr)) {
			return this.evalVariable(expr, environment);
		}

		if (Array.isArray(expr)) {
			if (expr[0] === "+") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left + right;
			} else if (expr[0] === "*") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left * right;
			} else if (expr[0] === ">") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left > right;
			} else if (expr[0] === "<") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left < right;
			} else if (expr[0] === ">=") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left >= right;
			} else if (expr[0] === "<=") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left <= right;
			} else if (expr[0] === "==") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left == right;
			} else if (expr[0] === "!=") {
				const { left, right } = this.extractBinaryArithmeticExpression(
					expr,
					environment
				);

				return left != right;
			} else if (expr[0] === "var") {
				const [, name, initializer] = expr;

				this.assertsVariableName(name);
				const initialValue = this.evalInEnvironment(
					initializer,
					environment
				);
				environment.define(name, initialValue);

				return initialValue;
			} else if (this.isBlockExpression(expr)) {
				return this.evalBlock(expr, environment);
			} else if (expr[0] === "set") {
				const [, name, initializer] = expr;

				this.assertsVariableName(name);

				const initialValue = this.evalInEnvironment(
					initializer,
					environment
				);
				environment.set(name, initialValue);

				return initialValue;
			}
		}

		throw "Unimplemented";
	}

	isBlockExpression(expr: Expression) {
		return Array.isArray(expr) && expr[0] === "begin";
	}

	evalBlock(expr: CompoundExpression, parent: Environment) {
		const blockEnv = new Environment({}, parent);
		const values = expr
			.slice(1)
			.map((e) => this.evalInEnvironment(e, blockEnv));

		return values[values.length - 1] || null;
	}

	isBooleanExpression(expr: Expression): expr is boolean {
		return typeof expr === "boolean";
	}

	evalBoolean(expr: BooleanExpression) {
		return expr;
	}

	assertsVariableName(name: Expression): asserts name is string {
		if (!this.isVariableName(name)) {
			throw new Error(`${JSON.stringify(name)}不是变量名称`);
		}
	}

	isVariableName(name: Expression): name is string {
		if (typeof name !== "string") {
			return false;
		}

		const namePattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
		return namePattern.test(name);
	}

	evalVariable(name: string, environment: Environment) {
		return environment.lookup(name);
	}

	extractBinaryArithmeticExpression(
		expr: Expression,
		environment: Environment
	) {
		if (!Array.isArray(expr)) {
			throw new Error(`算数运算表达式必须是数组${JSON.stringify(expr)}`);
		}

		const [, leftOp, rightOp] = expr;

		const left = this.evalInEnvironment(leftOp, environment);
		const right = this.evalInEnvironment(rightOp, environment);

		this.assertNumberExpression(left);
		this.assertNumberExpression(right);

		return { left, right };
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

	evalString(expr: string) {
		this.assertStringExpression(expr);
		return expr.slice(1, -1);
	}

	evalNumber(expr: number) {
		this.assertNumberExpression(expr);
		return expr;
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
