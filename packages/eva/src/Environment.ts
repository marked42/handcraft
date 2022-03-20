import { ExpressionValue } from "./expression";

interface EnvironmentRecord {
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

	lookup(name: string) {
		if (!this.has(name)) {
			throw new Error(`变量${name}不存在!`);
		}

		return this.record[name];
	}
}

export const defaultGlobalEnvironment = new Environment({
	PI: 3.1415926,
});
