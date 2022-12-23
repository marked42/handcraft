import { getStandardLibrary } from "./library";
import { Expression, ExpressionType, ListExpression } from "./expression";
import { SpecialForms } from "./special-forms";
import { parse } from "./parser";
import { Context } from "./context";
import { format } from "./utils";

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

    if (first.type === ExpressionType.Symbol) {
        if (SpecialForms[first.name]) {
            return SpecialForms[first.name](rest, context);
        }
    }

    const value = interpretExpression(first, context);

    if (value.type === ExpressionType.Procedure) {
        const args = rest.map((e) => interpretExpression(e, context));
        // don't need context
        return value.call(...args);
    }

    throw new Error(
        `list expression first argument must be procedure, get ${format(value)}`
    );
}
