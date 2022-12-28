import { format } from "./utils";

export enum ExpressionType {
    Number = "Number",
    String = "String",
    Boolean = "Boolean",
    Symbol = "Symbol",
    Procedure = "Procedure",
    List = "List",
}

export interface NumberExpression {
    type: ExpressionType.Number;
    value: number;
}

export interface StringExpression {
    type: ExpressionType.String;
    value: string;
}

export interface BooleanExpression {
    type: ExpressionType.Boolean;
    value: boolean;
}

export interface SymbolExpression {
    type: ExpressionType.Symbol;
    name: string;
}

export interface ProcedureExpression {
    type: ExpressionType.Procedure;
    call(...args: Expression[]): Expression;
    toString(): string;
}

export function createProcedure(
    fn: (...args: Expression[]) => Expression
): ProcedureExpression {
    const procedure: ProcedureExpression = {
        type: ExpressionType.Procedure,
        call(...args: Expression[]) {
            return fn(...args);
        },
        toString() {
            return `<procedure (...args...) (...native...)>`;
        },
    };

    return procedure;
}

export interface ListExpression<T = Expression> {
    type: ExpressionType.List;
    items: T[];
}

export type AtomExpression =
    | NumberExpression
    | StringExpression
    | BooleanExpression
    | ProcedureExpression
    | SymbolExpression;

export type Expression = AtomExpression | ListExpression;

export function createNumber(value: number): NumberExpression {
    return {
        type: ExpressionType.Number,
        value,
    };
}

export function createString(value: string): StringExpression {
    return {
        type: ExpressionType.String,
        value,
    };
}

export function createBoolean(value: boolean): BooleanExpression {
    return {
        type: ExpressionType.Boolean,
        value,
    };
}

export function createList(items: Expression[]): ListExpression {
    return { type: ExpressionType.List, items };
}

export function assertNumbers(
    args: Expression[]
): asserts args is NumberExpression[] {
    if (
        Array.isArray(args) &&
        args.length > 0 &&
        args.every((arg) => arg.type === ExpressionType.Number)
    ) {
        return;
    }

    throw new Error(
        `arguments must be numbers, get ${args.map(format).join(", ")}`
    );
}

export function assertStrings(
    args: Expression[]
): asserts args is StringExpression[] {
    if (
        Array.isArray(args) &&
        args.length > 0 &&
        args.every((arg) => arg.type === ExpressionType.String)
    ) {
        return;
    }

    throw new Error(
        `arguments must be string, get ${args.map(format).join(", ")}`
    );
}

export function assertBoolean(
    args: Expression[]
): asserts args is BooleanExpression[] {
    if (
        Array.isArray(args) &&
        args.length > 0 &&
        args.every((arg) => arg.type === ExpressionType.Boolean)
    ) {
        return;
    }

    throw new Error(
        `arguments must be boolean, get ${args.map(format).join(", ")}`
    );
}

export function assertList(
    args: Expression[]
): asserts args is ListExpression[] {
    if (
        Array.isArray(args) &&
        args.length > 0 &&
        args.every((arg) => arg.type === ExpressionType.List)
    ) {
        return;
    }

    throw new Error(
        `arguments must be lists, get ${args.map(format).join(", ")}`
    );
}

export function assertSymbolList(
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

// FIXME: conform to spec
export const isTruthy = (expr: Expression) => {
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
