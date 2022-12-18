import { getStandardLibrary } from "./library";
import { parseV2, Expression, ExpressionType, ListExpression } from "./parser";
import { Context } from "./context";

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
            return expr;
        default:
            // TODO: remove JSON.stringify
            throw new Error(
                `unsupported expr ${JSON.stringify(expr, null, 2)}`
            );
    }
}

function interpretListExpression(expr: ListExpression, context: Context) {
    if (expr.items.length === 0) {
        throw new Error("evaluate empty list expression illegally!");
    }

    const [first, ...rest] = expr.items;
    rest;

    if (first.type === ExpressionType.Symbol) {
        const value = context.get(first.name);

        if (!value) {
            throw new Error(`read non exist variable ${first.name}`);
        }
    }
}
