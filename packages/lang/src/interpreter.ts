import { type Atom, parse, type List } from "./parser";

export type Primitive = string | number;
export type Callable = (...args: ExprValue[]) => Primitive | void;
export type ExprValue = Primitive | Callable | Primitive[];
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

export function interpret(input: string, rootContext = new Context()) {
    const expressions = parse(input);

    if (expressions.length === 1) {
        return interpretExpression(expressions[0], rootContext);
    }

    expressions.forEach((expr) => {
        interpretExpression(expr, rootContext);
    });

    return;
}

export function interpretExpression(
    expr: Atom | List,
    context = new Context()
) {
    if (Array.isArray(expr)) {
        // return interpretList(expr);
        return;
    }

    if (expr.type === "string" || expr.type === "number") {
        return expr.value;
    }

    if (expr.type === "id") {
        return context.get(expr.value);
    }

    throw new Error(`unsupported expr ${String(expr)}`);
}
