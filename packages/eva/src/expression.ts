import { CallableObject } from "./callable";
import { Environment } from "./Environment";

export type NumberExpression = number;
export type BooleanExpression = boolean;
export type StringExpression = string;
export type AtomicExpression =
	| NumberExpression
	| StringExpression
	| BooleanExpression;
export type CompoundExpression = Array<AtomicExpression | CompoundExpression>;
export type Expression = AtomicExpression | CompoundExpression;

export type InternalValue = CallableObject | Environment;

export type AtomicExpressionValue =
	| string
	| number
	| boolean
	| null
	| InternalValue;

export interface Callable {
	(...args: ExpressionValue[]): ExpressionValue;
}

export type ExpressionValue = AtomicExpressionValue | Callable;
