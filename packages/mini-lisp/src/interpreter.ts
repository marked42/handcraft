import { type Atom, parse, type List } from "./parser";
import { Token, TokenIdentifier } from "./tokenizer";

export type Primitive = string | number;
export type Callable = (...args: ExprValue[]) => ExprValue;
export type ExprValue = Primitive | Callable | ExprValue[];
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

    throw new Error("invalid case, support only single expression.");
}

export function interpretExpression(
    expr: Atom | List,
    context = new Context()
): ExprValue {
    if (Array.isArray(expr)) {
        return interpretListExpression(expr, context);
    }

    if (expr.type === "string" || expr.type === "number") {
        return expr.value;
    }

    if (expr.type === "id") {
        return context.get(expr.value);
    }

    throw new Error(`unsupported expr ${String(expr)}`);
}

export function interpretListExpression(
    list: List,
    context: Context
): ExprValue {
    if (list.length === 0) {
        return [];
    }

    if (
        !Array.isArray(list[0]) &&
        list[0].type === "id" &&
        list[0].value === "lambda"
    ) {
        const [, formalArgs, body] = list;

        assertLambdaParameters(formalArgs);

        return function lambda(...args: ExprValue[]) {
            const scope: Scope = formalArgs.reduce((acc, formalArg, index) => {
                acc[formalArg.value] = args[index];
                return acc;
            }, {} as Scope);
            const lambdaScope = new Context(scope, context);
            return interpretExpression(body, lambdaScope);
        };
    }

    const values = list.map((item) => interpretExpression(item, context));

    const [first, ...rest] = values;
    if (typeof first === "function") {
        return first(...rest);
    }

    return values;
}

function assertLambdaParameters(
    list: List | Token
): asserts list is TokenIdentifier[] {
    if (
        !Array.isArray(list) ||
        list.some((item) => Array.isArray(item) || item.type !== "id")
    ) {
        throw new Error(`invalid parameters ${list.toString()}`);
    }
}
