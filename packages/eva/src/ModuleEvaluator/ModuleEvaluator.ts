import path from "path";
import fs from "fs";
import { Environment } from "../Environment";
import { CompoundExpression, Expression } from "../expression";
import { Eva } from "../Eva";

export class ModuleEvaluator {
	constructor(
		private readonly expr: CompoundExpression,
		private readonly environment: Environment,
		private readonly moduleFolder: string,
		private readonly interpreter: Eva
	) {}

	loadExternalModule() {
		// load module
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
		/* eslint-disable-next-line */
		const EvaParser = require("../parser");
		const moduleExpr = EvaParser.parse(
			`(begin ${moduleFileContent})`
		) as Expression;
		const wrapper = ["module", moduleName, moduleExpr];

		return wrapper;
	}

	evalModuleBody(expr: CompoundExpression) {
		const { environment } = this;
		const [, name, body] = expr;

		this.interpreter.assertsSymbol(name);
		this.interpreter.assertsBlockExpression(body);

		const moduleEnv = new Environment({}, environment);
		this.interpreter.evalBlock(body, environment, moduleEnv);

		return moduleEnv;
	}

	isInlineModule() {
		return this.expr[0] === "module";
	}

	isNamespaceImportModule() {
		const [tag, , ...importedNames] = this.expr;
		return tag === "import" && importedNames.length === 0;
	}

	isNamedImportModule() {
		const [tag, , ...importedNames] = this.expr;
		return tag === "import" && importedNames.length > 0;
	}

	get importedNames() {
		const [, , ...importedNames] = this.expr;
		this.interpreter.assertsSymbolArray(importedNames);

		return importedNames;
	}

	loadModule() {
		const { expr } = this;

		if (this.isInlineModule()) {
			// load module
			const [, name, body] = expr;
			this.interpreter.assertsSymbol(name);
			this.interpreter.assertsBlockExpression(body);

			return expr;
		} else if (this.isNamespaceImportModule()) {
			const wrapper = this.loadExternalModule();
			return wrapper;
		} else if (this.isNamedImportModule()) {
			const wrapper = this.loadExternalModule();
			return wrapper;
		}

		throw new Error("no way");
	}

	get name() {
		const [, name] = this.expr;
		this.interpreter.assertsSymbol(name);
		return name;
	}

	installModule(modEnv: Environment) {
		if (this.isInlineModule()) {
			// install
			this.environment.define(this.name, modEnv);

			return modEnv;
		} else if (this.isNamespaceImportModule()) {
			this.environment.define(this.name, modEnv);

			return modEnv;
		} else if (this.isNamedImportModule()) {
			// install
			this.importedNames.forEach((name) => {
				this.environment.define(name, modEnv.lookup(name));
			});

			const lastName = this.importedNames[this.importedNames.length - 1];

			return this.environment.lookup(lastName);
		}

		throw new Error("never");
	}

	evalImport() {
		const moduleExpression = this.loadModule();
		const modEnv = this.evalModuleBody(moduleExpression);
		return this.installModule(modEnv);
	}
}
