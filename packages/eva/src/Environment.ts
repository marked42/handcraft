import { ExpressionValue } from "./expression";

export interface EnvironmentRecord {
	[x: string]: ExpressionValue;
}

export class Environment {
	private readonly record: EnvironmentRecord;
	private readonly parent: Environment | null;

	constructor(
		record: EnvironmentRecord = {},
		parent: Environment | null = null
	) {
		this.record = record;
		this.parent = parent;
	}

	has(name: string) {
		return Object.keys(this.record).includes(name);
	}

	define(name: string, value: ExpressionValue) {
		if (this.has(name)) {
			throw new Error(`变量${name}已经存在，不能重复定义！`);
		}

		this.record[name] = value;
	}

	resolve(name: string) {
		/* eslint-disable-next-line */
		let env: Environment | null = this;

		while (env) {
			if (env.has(name)) {
				return env;
			}
			env = env.parent;
		}

		return null;
	}

	lookup(name: string): ExpressionValue {
		const env: Environment | null = this.resolve(name);

		if (!env) {
			this.throwOnUndefinedVariable(name);
		}

		return env.record[name];
	}

	set(name: string, value: ExpressionValue) {
		const env: Environment | null = this.resolve(name);

		if (!env) {
			this.throwOnUndefinedVariable(name);
		}

		return (env.record[name] = value);
	}

	throwOnUndefinedVariable(name: string): never {
		throw new ReferenceError(`变量${name}不存在!`);
	}

	static createGlobalEnvironment() {
		return new Environment({
			PI: 3.1415926,
			print(...msg: ExpressionValue[]): ExpressionValue {
				console.log(...msg);
				return null;
			},
			"+"(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 + op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			"-"(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 - op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			"*"(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 * op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			"/"(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 / op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			"=="(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				return op1 === op2;
			},
			"!="(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				return op1 !== op2;
			},
			">"(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 > op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			">="(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 >= op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			"<"(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 < op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
			"<="(op1: ExpressionValue, op2: ExpressionValue): ExpressionValue {
				if (typeof op1 === "number" && typeof op2 === "number") {
					return op1 <= op2;
				}

				throw new Error(
					`plus unsupported for operators ${JSON.stringify(
						op1
					)} and ${JSON.stringify(op2)}`
				);
			},
		});
	}
}
