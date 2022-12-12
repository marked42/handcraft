import { type Atom, parse, type List } from "./parser";

export function interpret(input: string) {
    const expressions = parse(input);

    if (expressions.length === 1) {
        return interpretExpression(expressions[0]);
    }

    expressions.forEach((expr) => {
        interpretExpression(expr);
    });

    return;
}

export function interpretExpression(expr: Atom | List) {
    if (Array.isArray(expr)) {
        // return interpretList(expr);
        return;
    }

    if (expr.type === "string" || expr.type === "number") {
        return expr.value;
    }

    throw new Error(`unsupported expr ${String(expr)}`);
}
