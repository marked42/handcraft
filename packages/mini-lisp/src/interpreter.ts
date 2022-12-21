import { getStandardLibrary } from "./library";
import { parseV2, Expression, ExpressionType, ListExpression } from "./parser";
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
            // TODO: remove JSON.stringify
            throw new Error(`unsupported expr ${format(expr)}`);
    }
}

function interpretListExpression(
    expr: ListExpression,
    context: Context
): Expression {
    if (expr.items.length === 0) {
        // return empty list
        return expr;
    }

    const [first, ...rest] = expr.items;

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

        const value = context.get(first.name);

        if (!value) {
            throw new Error(`read non exist variable ${first.name}`);
        }

        if (value.type === ExpressionType.Procedure) {
            const args = rest.map((e) => interpretExpression(e, context));
            // TODO: scope
            // const procedureScope =
            // const procedureContext = new Context({}, context);
            return value.call(...args);
        }

        throw new Error(`unresolved symbol at list head, ${format(expr)}`);
    }

    const result: ListExpression = {
        type: ExpressionType.List,
        items: expr.items.map((e) => interpretExpression(e, context)),
    };

    return result;
}
