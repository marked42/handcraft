import path from "path";
import fs from "fs";
import { Environment } from "../Environment";
import { CompoundExpression, ExpressionValue } from "../expression";
import { Eva } from "../Eva";
import { EvaParser } from "../parser";

export abstract class ModuleEvaluator {
	constructor(
		protected readonly name: string,
		protected readonly expr: CompoundExpression,
		protected readonly environment: Environment,
		protected readonly moduleFolder: string,
		protected readonly interpreter: Eva
	) {}

	evalModuleBody(expr: CompoundExpression) {
		const { environment } = this;
		const [, name, body] = expr;

		this.interpreter.assertsSymbol(name);
		this.interpreter.assertsBlockExpression(body);

		const moduleEnv = new Environment({}, environment);
		this.interpreter.evalBlock(body, environment, moduleEnv);

		return moduleEnv;
	}

	abstract loadModule(): CompoundExpression;

	abstract installModule(environment: Environment): ExpressionValue;

	evalModuleDefinition() {
		const moduleExpression = this.loadModule();

		const modEnv = this.evalModuleBody(moduleExpression);

		return this.installModule(modEnv);
	}
}

export function createModuleEvaluator(
	expr: CompoundExpression,
	environment: Environment,
	moduleFolder: string,
	interpreter: Eva
): ModuleEvaluator {
	const [tag, name, ...importedNames] = expr;
	interpreter.assertsSymbol(name);

	const isInlineModule = tag === "module";
	if (isInlineModule) {
		return new InlineModuleEvaluator(
			name,
			expr,
			environment,
			moduleFolder,
			interpreter
		);
	}

	const isNamespaceImportModule =
		tag === "import" && importedNames.length === 0;
	if (isNamespaceImportModule) {
		return new NamespaceModuleEvaluator(
			name,
			expr,
			environment,
			moduleFolder,
			interpreter
		);
	}

	const isNamedImportModule = tag === "import" && importedNames.length > 0;
	if (isNamedImportModule) {
		interpreter.assertsSymbolArray(importedNames);
		return new NamedModuleEvaluator(
			name,
			expr,
			environment,
			moduleFolder,
			interpreter,
			importedNames
		);
	}

	throw new Error("invalid module definition");
}

export class InlineModuleEvaluator extends ModuleEvaluator {
	constructor(
		protected readonly name: string,
		protected readonly expr: CompoundExpression,
		protected readonly environment: Environment,
		protected readonly moduleFolder: string,
		protected readonly interpreter: Eva
	) {
		super(name, expr, environment, moduleFolder, interpreter);
	}

	loadModule(): CompoundExpression {
		const { expr } = this;
		// load module
		const [, name, body] = expr;
		this.interpreter.assertsSymbol(name);
		this.interpreter.assertsBlockExpression(body);

		return expr;
	}

	// 重复的情况，使用函数式组合更合适
	installModule(modEnv: Environment): ExpressionValue {
		// install
		this.environment.define(this.name, modEnv);

		return modEnv;
	}
}

export abstract class ExternalModuleEvaluator extends ModuleEvaluator {
	constructor(
		protected readonly name: string,
		protected readonly expr: CompoundExpression,
		protected readonly environment: Environment,
		protected readonly moduleFolder: string,
		protected readonly interpreter: Eva
	) {
		super(name, expr, environment, moduleFolder, interpreter);
	}

	loadModule(): CompoundExpression {
		const [, moduleName, ...importedNames] = this.expr;
		this.interpreter.assertsSymbol(moduleName);
		this.interpreter.assertsSymbolArray(importedNames);

		const moduleFilePath = path.join(
			this.moduleFolder,
			`${moduleName}.eva`
		);
		const moduleFileContent: string = fs.readFileSync(moduleFilePath, {
			encoding: "utf-8",
		});
		const moduleExpr = EvaParser.parse(`(begin ${moduleFileContent})`);
		const wrapper = ["module", moduleName, moduleExpr];

		return wrapper;
	}
}

export class NamespaceModuleEvaluator extends ExternalModuleEvaluator {
	constructor(
		protected readonly name: string,
		protected readonly expr: CompoundExpression,
		protected readonly environment: Environment,
		protected readonly moduleFolder: string,
		protected readonly interpreter: Eva
	) {
		super(name, expr, environment, moduleFolder, interpreter);
	}

	installModule(modEnv: Environment): ExpressionValue {
		this.environment.define(this.name, modEnv);

		return modEnv;
	}
}

export class NamedModuleEvaluator extends ExternalModuleEvaluator {
	constructor(
		protected readonly name: string,
		protected readonly expr: CompoundExpression,
		protected readonly environment: Environment,
		protected readonly moduleFolder: string,
		protected readonly interpreter: Eva,
		private readonly importNames: string[]
	) {
		super(name, expr, environment, moduleFolder, interpreter);
	}

	installModule(modEnv: Environment): ExpressionValue {
		this.importNames.forEach((name) => {
			this.environment.define(name, modEnv.lookup(name));
		});

		const lastName = this.importNames[this.importNames.length - 1];

		return this.environment.lookup(lastName);
	}
}
