export type NumberExpression = number;
export type BooleanExpression = boolean;
export type StringExpression = string;
export type AtomicExpression =
	| NumberExpression
	| StringExpression
	| BooleanExpression;
export type CompoundExpression = Array<AtomicExpression | CompoundExpression>;
export type Expression = AtomicExpression | CompoundExpression;

export type AtomicExpressionValue = string | number | boolean | null;

export type ExpressionValue =
	| AtomicExpressionValue
	| ((...args: ExpressionValue[]) => AtomicExpressionValue);
