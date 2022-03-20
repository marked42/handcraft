export type NumberExpression = number;
export type StringExpression = string;
export type AtomicExpression = NumberExpression | StringExpression;
export type CompoundExpression = Array<AtomicExpression>;
export type Expression = AtomicExpression | CompoundExpression;
