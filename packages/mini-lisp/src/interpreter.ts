import { getStandardLibrary } from "./library";
import {
    parseV2,
    Expression,
    ExpressionType,
    ListExpression,
    createProcedure,
    SymbolExpression,
} from "./parser";
import { Context } from "./context";
import { format } from "./utils";

export function interpret(
    input: string,
    rootContext = new Context(getStandardLibrary())
) {
    const expressions = parseV2(input);
    if (expressions.length === 1) {
        return interpretExpression(expressions[0], rootContext);
    }

    throw new Error("invalid case, support only single expression.");
}

export function interpretExpression(expr: Expression, context: Context) {
    switch (expr.type) {
        case ExpressionType.List:
            return interpretListExpression(expr, context);
        case ExpressionType.String:
        case ExpressionType.Number:
        case ExpressionType.Boolean:
            return expr;
        case ExpressionType.Symbol:
            return context.get(expr.name);
        default:
            throw new Error(`unsupported expr ${format(expr)}`);
    }
}

function interpretListExpression(
    expr: ListExpression,
    context: Context
): Expression {
    if (expr.items.length === 0) {
        throw new Error("evaluate empty list expression illegally!");
    }

    const [first, ...rest] = expr.items;

    // TODO: refactor special forms
    if (first.type === ExpressionType.Symbol) {
        if (first.name === "if") {
            if (rest.length !== 3) {
                throw new Error(`if accepts 3 arguments, get ${format(rest)}`);
            }
            const [test, consequent, alternate] = rest.map((e) =>
                interpretExpression(e, context)
            );

            // FIXME: conform to spec
            const isTruthy = (expr: Expression) => {
                switch (expr.type) {
                    case ExpressionType.Boolean:
                        return expr.value;
                    case ExpressionType.Number:
                        return expr.value !== 0;
                    case ExpressionType.List:
                        return expr.items.length > 0;
                    default:
                        throw new Error("invalid case");
                }
            };

            return isTruthy(test) ? consequent : alternate;
        }

        if (first.name === "define") {
            if (rest.length !== 2) {
                throw new Error(
                    `define accepts 2 parameters, get ${rest.length}`
                );
            }

            // do not evaluate variable, not defined yet.
            const [variable, init] = rest;
            if (variable.type !== ExpressionType.Symbol) {
                throw new Error(
                    `define requires first parameter to be symbol, get ${format(
                        variable
                    )}`
                );
            }
            const value = interpretExpression(init, context);
            context.define(variable.name, value);

            return value;
        }

        if (first.name === "set!") {
            if (rest.length !== 2) {
                throw new Error(
                    `set! accepts 2 parameters, get ${rest.length}`
                );
            }

            // do not evaluate variable
            const [variable, init] = rest;
            if (variable.type !== ExpressionType.Symbol) {
                throw new Error(
                    `set! requires first parameter to be symbol, get ${format(
                        variable
                    )}`
                );
            }
            const value = interpretExpression(init, context);
            context.set(variable.name, value);

            return value;
        }

        if (first.name === "lambda") {
            if (rest.length !== 2) {
                throw new Error(
                    `lambda accepts 2 parameters, get ${format(rest)}`
                );
            }

            const [parameters, body] = rest;
            assertSymbolList(parameters);

            return createProcedure((...args: Expression[]) => {
                if (args.length !== parameters.items.length) {
                    throw new Error(
                        `lambda accepts ${
                            parameters.items.length
                        } parameters, get ${args.length} ${format(args)}`
                    );
                }

                const lambdaContext = createCallContext(
                    context,
                    parameters,
                    args
                );

                return interpretExpression(body, lambdaContext);
            });
        }
    }

    const value = interpretExpression(first, context);

    if (value.type === ExpressionType.Procedure) {
        const args = rest.map((e) => interpretExpression(e, context));
        // TODO: scope
        // const procedureScope =
        // const procedureContext = new Context({}, context);
        return value.call(...args);
    }

    throw new Error(
        `list expression first argument must be procedure, get ${format(value)}`
    );
}

function assertSymbolList(
    list: Expression
): asserts list is ListExpression<SymbolExpression> {
    if (
        list.type !== ExpressionType.List ||
        list.items.some((p) => p.type !== ExpressionType.Symbol)
    ) {
        throw new Error(
            `lambda first parameter must be a list of symbols, get ${format(
                list
            )}`
        );
    }
}

function createCallContext(
    context: Context,
    parameters: ListExpression<SymbolExpression>,
    args: Expression[]
) {
    const scope: Record<string, Expression> = {};
    parameters.items.forEach((p, i) => {
        scope[p.name] = args[i];
    });
    return new Context(scope, context);
}
