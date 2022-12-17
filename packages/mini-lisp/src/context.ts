import { ExprValue } from "./data-types";
export type Scope = Record<string, ExprValue>;

export class Context {
    constructor(
        private readonly scope: Scope = {},
        public readonly parent?: Context
    ) {}

    get(name: string): ExprValue {
        if (this.scope[name] !== undefined) {
            return this.scope[name];
        }

        const value = this.parent?.get(name);
        if (value !== undefined) {
            return value;
        }

        throw new Error(`undefined variable ${name}`);
    }
}
