export type NumberExpression = number;
export type BooleanExpression = boolean;
export type StringExpression = string;
export type AtomicExpression =
	| NumberExpression
	| StringExpression
	| BooleanExpression;
export type CompoundExpression = Array<AtomicExpression | CompoundExpression>;
export type Expression = AtomicExpression | CompoundExpression;

export type ExpressionValue = string | number | boolean;
