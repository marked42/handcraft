export enum ExpressionType {
    Number = "Number",
    String = "String",
    Boolean = "Boolean",
    Symbol = "Symbol",
    Procedure = "Procedure",
    List = "List",
    Pair = "Pair",
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

export function createList(items: Expression[]): ListExpression {
    return { type: ExpressionType.List, items };
}

export interface PairExpression {
    type: ExpressionType.Pair;
    first: Expression;
    second: Expression;
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
