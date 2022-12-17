export type NullValue = undefined;
export type Primitive = string | number | boolean | NullValue;
export type Callable = (...args: ExprValue[]) => ExprValue;
export type ExprValue = Primitive | Callable | ExprValue[];
