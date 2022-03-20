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

	get(name: string) {
		return this.record[name];
	}
}

export const defaultGlobalEnvironment = new Environment({
	PI: 3.1415926,
});
