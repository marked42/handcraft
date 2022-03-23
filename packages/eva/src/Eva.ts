import { Environment, EnvironmentRecord } from "./Environment";
import fs from "fs";
import path from "path";
import {
	BooleanExpression,
	CompoundExpression,
	Expression,
	ExpressionValue,
	StringExpression,
} from "./expression";
import {
	CallableObject,
	createCallableObject,
	isCallableObject,
} from "./callable";
import { JITTransformer } from "./JITTransformer";
import { ModuleEvaluator } from "./ModuleEvaluator";

export class Eva {
	private readonly transformer = new JITTransformer();
	private moduleFolder: string = process.cwd();

	constructor(
		private readonly globalEnvironment = Environment.createGlobalEnvironment()
	) {}

	setModuleFolder(path: string) {
		this.moduleFolder = path;
	}

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

		if (this.isSymbolName(expr)) {
			if (expr === "null") {
				return null;
			}
			return this.evalVariable(expr, environment);
		}

		if (Array.isArray(expr)) {
			if (expr[0] === "var") {
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
				const [, ref, initializer] = expr;

				const initialValue = this.evalInEnvironment(
					initializer,
					environment
				);

				if (Array.isArray(ref) && ref[0] === "prop") {
					const [, instance, prop] = ref;
					this.assertsSymbol(instance);
					this.assertsSymbol(prop);
					const classEnv = this.evalInEnvironment(
						instance,
						environment
					) as Environment;

					classEnv.set(prop, initialValue);
					return initialValue;
				}

				this.assertsVariableName(ref);

				environment.set(ref, initialValue);

				return initialValue;
			} else if (expr[0] === "if") {
				return this.evalIfExpression(expr, environment);
			} else if (expr[0] === "while") {
				return this.evalWhileExpression(expr, environment);
			} else if (expr[0] === "for") {
				return this.evalFor(expr, environment);
			} else if (expr[0] === "def") {
				// JIT transpile function declaration to variable declaration
				const variableDeclaration =
					this.transformer.transformFunctionDeclaration(expr);

				return this.evalInEnvironment(variableDeclaration, environment);
			} else if (expr[0] === "++") {
				return this.evalInEnvironment(
					this.transformer.transformIncrement(expr),
					environment
				);
			} else if (expr[0] === "--") {
				return this.evalInEnvironment(
					this.transformer.transformDecrement(expr),
					environment
				);
			} else if (expr[0] === "+=") {
				return this.evalInEnvironment(
					this.transformer.transformPlusAssignment(expr),
					environment
				);
			} else if (expr[0] === "-=") {
				return this.evalInEnvironment(
					this.transformer.transformMinusAssignment(expr),
					environment
				);
			} else if (expr[0] === "lambda") {
				const [, parameters, body] = expr;

				this.assertsSymbolArray(parameters);

				const fn = createCallableObject({
					fnName: "anonymous",
					parameters,
					body,
					environment,
				});

				return fn;
			} else if (expr[0] === "switch") {
				return this.evalSwitch(expr, environment);
			} else if (expr[0] === "class") {
				return this.evalClass(expr, environment);
			} else if (expr[0] === "new") {
				return this.evalNew(expr, environment);
			} else if (expr[0] === "prop") {
				return this.evalProp(expr, environment);
			} else if (expr[0] === "super") {
				return this.evalSuper(expr, environment);
			} else if (expr[0] === "module" || expr[0] === "import") {
				return this.evalImport(expr, environment);
			} else {
				const [symbol, ...parameters] = expr;
				const fn = this.evalInEnvironment(symbol, environment);

				const actualParameters = parameters.map((p) =>
					this.evalInEnvironment(p, environment)
				);

				if (isCallableObject(fn)) {
					return this.evalCallableObject(fn, actualParameters);
				}

				if (typeof fn === "function") {
					return fn(...actualParameters);
				}
			}
		}

		throw "Unimplemented";
	}

	// @ts-expect-error ignore
	assertsCallableObject(expr: Expression): asserts expr is CallableObject {
		if (!isCallableObject(expr)) {
			throw new Error(`${JSON.stringify(expr)}不是callable`);
		}
	}

	// assertsSymbolArray(names: CompoundExpression): asserts names is string[] {
	// 	if (!names.every((name) => this.isStringExpression(name))) {
	// 		throw new Error(`names 不是字符串数组 ${JSON.stringify(names)}`);
	// 	}
	// }

	evalImport(expr: CompoundExpression, environment: Environment) {
		const moduleEvaluator = new ModuleEvaluator(
			expr,
			environment,
			this.moduleFolder,
			this
		);

		return moduleEvaluator.evalImport();
	}

	evalSuper(expr: CompoundExpression, environment: Environment) {
		const [, name] = expr;

		this.assertsSymbol(name);
		const classEnv = this.evalInEnvironment(name, environment);
		this.assertsEnvironment(classEnv);

		const parentClass = classEnv.parent;
		this.assertsEnvironment(parentClass);

		return parentClass;
	}

	assertsEnvironment(expr: ExpressionValue): asserts expr is Environment {
		if (!(expr instanceof Environment)) {
			throw new Error(`${JSON.stringify(expr)} must be environment. `);
		}
	}

	// property read
	evalProp(expr: CompoundExpression, environment: Environment) {
		const [, instance, name] = expr;

		// this.assertsSymbol(instance);
		this.assertsSymbol(name);

		const instanceEnv = this.evalInEnvironment(
			instance,
			environment
		) as Environment;

		const prop = this.evalInEnvironment(name, instanceEnv);
		return prop;
	}

	evalNew(expr: CompoundExpression, environment: Environment) {
		const [, name, ...parameters] = expr;

		const classEnv = this.evalInEnvironment(
			name,
			environment
		) as Environment;

		const constructor = classEnv.lookup("constructor") as CallableObject;

		// 特殊处理，类实例也用Environment表示，父节点是classEnv
		const instance = new Environment({}, classEnv);
		const actualParameters = parameters.map((p) =>
			this.evalInEnvironment(p, environment)
		);
		this.evalCallableObject(constructor, [instance, ...actualParameters]);

		return instance;
	}

	evalClass(expr: CompoundExpression, environment: Environment) {
		const [, name, parent, body] = expr;

		this.assertsSymbol(name);
		this.assertsSymbol(parent);
		// 必须保证全局变量被找到
		const parentEnv =
			this.evalInEnvironment(parent, environment) || environment;
		const classEnv = new Environment(
			{},
			// @ts-expect-error ignore for now
			parentEnv
		);
		this.assertsBlockExpression(body);
		this.evalBlock(body, environment, classEnv);

		this.evalInEnvironment(body, classEnv);

		environment.define(name, classEnv);

		return classEnv;
	}

	evalMinusAssignmentDirectly(
		expr: CompoundExpression,
		environment: Environment
	) {
		const [, variable, step] = expr;

		this.assertsSymbol(variable);

		const currentValue = this.evalInEnvironment(variable, environment);
		// @ts-expect-error ignore checking
		this.assertNumberExpression(currentValue);
		const incrementedValue = this.evalInEnvironment(step, environment);
		// @ts-expect-error ignore checking
		this.assertNumberExpression(incrementedValue);

		const value = currentValue - incrementedValue;

		environment.set(variable, value);

		return value;
	}

	evalPlusAssignmentDirectly(
		expr: CompoundExpression,
		environment: Environment
	) {
		const [, variable, step] = expr;

		this.assertsSymbol(variable);

		const currentValue = this.evalInEnvironment(variable, environment);
		// @ts-expect-error ignore checking
		this.assertNumberExpression(currentValue);
		const incrementedValue = this.evalInEnvironment(step, environment);
		// @ts-expect-error ignore checking
		this.assertNumberExpression(incrementedValue);

		const value = currentValue + incrementedValue;

		environment.set(variable, value);

		return value;
	}

	evalDecrementDirectly(expr: CompoundExpression, environment: Environment) {
		const [, variable] = expr;

		this.assertsSymbol(variable);

		const currentValue = this.evalInEnvironment(variable, environment);
		// @ts-expect-error ignore checking
		this.assertNumberExpression(currentValue);
		const incrementedValue = 1;
		this.assertNumberExpression(incrementedValue);

		const value = currentValue - incrementedValue;

		environment.set(variable, value);

		return value;
	}

	evalIncrementDirectly(expr: CompoundExpression, environment: Environment) {
		const [, variable] = expr;

		this.assertsSymbol(variable);

		const currentValue = this.evalInEnvironment(variable, environment);
		// @ts-expect-error ignore checking
		this.assertNumberExpression(currentValue);
		const incrementedValue = 1;
		this.assertNumberExpression(incrementedValue);

		const value = currentValue + incrementedValue;

		environment.set(variable, value);

		return value;
	}

	evalFor(expr: CompoundExpression, environment: Environment) {
		const whileExpr = this.transformer.transformForToWhile(expr);
		return this.evalInEnvironment(whileExpr, environment);
	}

	evalForDirectly(expr: CompoundExpression, environment: Environment) {
		const [, initializer, condition, modifier, body] = expr;

		this.evalInEnvironment(initializer, environment);
		let result = null;
		while (this.evalInEnvironment(condition, environment)) {
			result = this.evalInEnvironment(body, environment);
			this.evalInEnvironment(modifier, environment);
		}
		return result;
	}

	evalSwitch(expr: CompoundExpression, environment: Environment) {
		const transformed = this.transformer.transformSwitchCase(expr);

		return this.evalInEnvironment(transformed, environment);
	}

	directEvalSwitch(expr: CompoundExpression, environment: Environment) {
		const [, ...cases] = expr;

		for (const e of cases) {
			if (!Array.isArray(e)) {
				throw new Error(
					"invalid switch case branch, must be an array."
				);
			}
			const [condition, value] = e;
			if (
				condition === "else" ||
				this.evalInEnvironment(condition, environment)
			) {
				return this.evalInEnvironment(value, environment);
			}
		}

		throw new Error("invalid switch case, must have else branch");
	}

	evalCallableObject(
		fn: CallableObject,
		actualParameters: ExpressionValue[]
	) {
		const { parameters, body, environment } = fn;

		const activationRecord = parameters.reduce((acc, name, i) => {
			acc[name] = actualParameters[i];

			return acc;
		}, {} as EnvironmentRecord);

		const fnEnv = new Environment(activationRecord, environment);

		return this.evalInEnvironment(body, fnEnv);
	}

	isExpression(expr: Expression) {
		const predicates = [
			this.isStringExpression,
			this.isBooleanExpression,
			this.isNumberExpression,
			this.isSymbolName,
			Array.isArray,
		];
		return predicates.some((p) => p(expr));
	}

	assertsIfExpression(expr: Expression) {
		if (Array.isArray(expr)) {
			const [key, condition, consequent, alternate] = expr;

			if (
				key === "if" &&
				[condition, consequent, alternate].every((expr) =>
					this.isExpression(expr)
				)
			) {
				return;
			}
		}

		throw new Error(
			`语法错误，${JSON.stringify(expr)}不是合法的if表达式。`
		);
	}

	evalIfExpression(expr: CompoundExpression, environment: Environment) {
		const [, condition, consequent, alternate] = expr;

		this.assertsIfExpression(expr);

		if (this.evalInEnvironment(condition, environment)) {
			return this.evalInEnvironment(consequent, environment);
		}
		return this.evalInEnvironment(alternate, environment);
	}

	assertsWhileExpression(expr: Expression) {
		if (Array.isArray(expr)) {
			const [key, condition, body] = expr;
			if (
				key === "while" &&
				this.isExpression(condition) &&
				this.isExpression(body)
			) {
				return true;
			}
		}

		throw new Error(
			`语法错误，${JSON.stringify(expr)}不是合法的while表达式。`
		);
	}

	evalWhileExpression(expr: CompoundExpression, environment: Environment) {
		const [, condition, body] = expr;

		this.assertsWhileExpression(expr);

		let result: ExpressionValue = null;
		while (this.evalInEnvironment(condition, environment)) {
			result = this.evalInEnvironment(body, environment);
		}

		return result;
	}

	isBlockExpression(expr: Expression) {
		return Array.isArray(expr) && expr[0] === "begin";
	}

	assertsBlockExpression(
		expr: Expression
	): asserts expr is CompoundExpression {
		if (!this.isBlockExpression(expr)) {
			throw new Error(`${JSON.stringify(expr)}必须是block`);
		}
	}

	evalBlock(
		expr: CompoundExpression,
		parent: Environment,
		blockEnv: Environment = new Environment({}, parent)
	) {
		const values = expr
			.slice(1)
			.map((e) => this.evalInEnvironment(e, blockEnv));

		return values[values.length - 1] || null;
	}

	isBooleanExpression(this: void, expr: Expression): expr is boolean {
		return typeof expr === "boolean";
	}

	evalBoolean(expr: BooleanExpression) {
		return expr;
	}

	assertsVariableName(name: Expression): asserts name is string {
		if (!this.isSymbolName(name)) {
			throw new Error(`${JSON.stringify(name)}不是变量名称`);
		}
	}

	/**
	 * symbol includes comparison and arithmetic operation characters < <= ...
	 */
	isSymbolName(this: void, name: Expression): name is string {
		if (typeof name !== "string") {
			return false;
		}

		const namePattern = /^[a-zA-Z+\-*\/><=!][a-zA-Z0-9+\-*\/><=!_]*$/;
		return namePattern.test(name);
	}

	evalVariable(name: string, environment: Environment) {
		return environment.lookup(name);
	}

	isStringExpression(this: void, expr: Expression): expr is string {
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

	assertsSymbol(expr: Expression): asserts expr is StringExpression {
		if (!this.isSymbolName(expr)) {
			throw new Error(`${JSON.stringify(expr)}不是合法的符号`);
		}
	}

	assertsSymbolArray(expr: Expression): asserts expr is StringExpression[] {
		if (!Array.isArray(expr) || expr.some((e) => !this.isSymbolName(e))) {
			throw new Error(
				`函数参数形式${JSON.stringify(expr)}不合法，必须是符号数组`
			);
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

	isNumberExpression(this: void, expr: Expression): expr is number {
		return typeof expr === "number";
	}

	assertNumberExpression(expr: Expression): asserts expr is number {
		if (!this.isNumberExpression(expr)) {
			throw new Error(`表达式${JSON.stringify(expr)}的参数必须是数字`);
		}
	}
}
