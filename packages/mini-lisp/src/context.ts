import { Expression, ProcedureExpression } from "./parser";
export type Scope = Record<string, ProcedureExpression>;

export interface Reference {
    base: Context;
    name: string;
}

export class Context {
    constructor(
        private readonly scope: Scope = {},
        public readonly parent?: Context
    ) {}

    has(name: string) {
        return this.scope[name] !== undefined;
    }

    get root(): Context {
        if (this.parent) {
            return this.parent.root;
        }

        return this;
    }

    /**
     * 1. 不允许变量重新定义
     * 2. 不允许与内置符号重名的变量定义
     *
     * FIXME: 当前实现中在全局作用域定义变量a，无法区分a是内置符号还是自定义符号，需要添加信息区分。
     */
    define(name: string, value: Expression) {
        if (this.root.scope[name] !== undefined) {
            throw new Error(
                `cannot define variable ${name}, it's builtin procedure name.`
            );
        }
        if (this.has(name)) {
            throw new Error(`cannot redefine existing variable ${name}!`);
        }

        this.scope[name] = value;
    }

    lookup(name: string): Reference | undefined {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let context: Context | undefined = this;

        while (context) {
            if (context.has(name)) {
                return { base: context, name };
            }
            context = context.parent;
        }

        return undefined;
    }

    get(name: string): Expression {
        const reference = this.lookup(name);

        if (reference) {
            return reference.base.scope[name];
        }

        throw new Error(`undefined variable ${name}`);
    }

    set(name: string, value: Expression): Expression {
        const reference = this.lookup(name);

        if (!reference) {
            throw new Error(`undefined variable ${name}`);
        }

        reference.base.scope[name] = value;
        return value;
    }
}
