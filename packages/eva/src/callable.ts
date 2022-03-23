import { Environment } from "./Environment";
import { Expression, ExpressionValue, StringExpression } from "./expression";

export interface CallableObject {
	fnName: string;
	parameters: StringExpression[];
	body: Expression;
	environment: Environment;
}

const internalId = 0x12345678;

export const createCallableObject = (options: CallableObject) => {
	const callable: CallableObject = { ...options };

	// @ts-expect-error internal id
	callable["__fn__"] = internalId;

	return callable;
};

export function isCallableObject(
	obj: Expression | ExpressionValue
): obj is CallableObject {
	return (
		typeof obj === "object" &&
		obj !== null &&
		// @ts-expect-error allow
		obj?.["__fn__"] === internalId
	);
}
