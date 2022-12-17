import { getStandardLibrary } from "./library";
import { type Atom, parse, type List } from "./parser";
import { Token, TokenSymbol, TokenType } from "./tokenizer";
import { Context, type Scope } from "./context";
import { ExprValue } from "./data-types";

export function interpret(
    input: string,
    rootContext = new Context(getStandardLibrary())
) {
    const expressions = parse(input);
    if (expressions.length === 1) {
        return interpretExpression(expressions[0], rootContext);
    }

    throw new Error("invalid case, support only single expression.");
}

function interpretExpression(
    expr: Atom | List,
    context = new Context()
): ExprValue {
    if (Array.isArray(expr)) {
        return interpretListExpression(expr, context);
    }

    if (expr.type === TokenType.String || expr.type === TokenType.Number) {
        return expr.value;
    }

    if (expr.type === TokenType.Symbol) {
        return context.get(expr.name);
    }

    throw new Error(`unsupported expr ${expr.source}`);
}

function interpretListExpression(list: List, context: Context): ExprValue {
    if (list.length === 0) {
        return [];
    }

    if (isSymbol(list[0])) {
        const { name } = list[0];
        if (name === "lambda") {
            const [, formalArgs, body] = list;

            assertLambdaParameters(formalArgs);

            return function lambda(...args: ExprValue[]) {
                const scope: Scope = formalArgs.reduce(
                    (acc, formalArg, index) => {
                        acc[formalArg.name] = args[index];
                        return acc;
                    },
                    {} as Scope
                );
                const lambdaScope = new Context(scope, context);
                return interpretExpression(body, lambdaScope);
            };
        }

        if (name === "define") {
            const rest = list.slice(1);
            if (rest.length === 0) {
                throw new Error(
                    "missing variable name and initial value, define accepts two arguments."
                );
            }
            const [symbol, value] = rest;
            if (!isSymbol(symbol)) {
                throw new Error(
                    `define first argument must be symbol, received ${symbol.toString()}`
                );
            }
            context.define(symbol.name, interpretExpression(value));
            return;
        }

        if (name === "if") {
            const [, test, consequent, alternation] = list;

            const expr = interpretExpression(test)
                ? interpretExpression(consequent)
                : interpretExpression(alternation);

            // macro expansion
            return expr;
        }
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
): asserts list is TokenSymbol[] {
    if (
        !Array.isArray(list) ||
        list.some(
            (item) => Array.isArray(item) || item.type !== TokenType.Symbol
        )
    ) {
        throw new Error(`invalid parameters ${list.toString()}`);
    }
}

function isSymbol(value: List | Token): value is TokenSymbol {
    return !Array.isArray(value) && value.type === TokenType.Symbol;
}
