import { Scope } from "./context";
import { format } from "./utils";
import {
    BooleanExpression,
    createBoolean,
    createList,
    createNumber,
    createProcedure,
    createString,
    Expression,
    ExpressionType,
    ListExpression,
    NumberExpression,
    StringExpression,
} from "./parser";

function assertNumbers(args: Expression[]): asserts args is NumberExpression[] {
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

function assertStrings(args: Expression[]): asserts args is StringExpression[] {
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

function assertBoolean(
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

function assertList(args: Expression[]): asserts args is ListExpression[] {
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

/**
 * 使用函数每次获取独立的标准函数库定义
 */
export function getStandardLibrary() {
    const arithmetic: Scope = {
        "+": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);
            return createNumber(params[0].value + params[1].value);
        }),
        "-": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);
            return createNumber(params[0].value - params[1].value);
        }),
        "*": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);
            return createNumber(params[0].value * params[1].value);
        }),
        "/": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);
            return createNumber(params[0].value / params[1].value);
        }),
        expt: createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);
            return createNumber(Math.pow(params[0].value, params[1].value));
        }),
        round: createProcedure((left: Expression) => {
            const params = [left];
            assertNumbers(params);
            return createNumber(Math.round(params[0].value));
        }),
        max: createProcedure((...params: Expression[]) => {
            assertNumbers(params);
            return createNumber(Math.max(...params.map((p) => p.value)));
        }),
        min: createProcedure((...params: Expression[]) => {
            assertNumbers(params);
            return createNumber(Math.min(...params.map((p) => p.value)));
        }),
        "number?": createProcedure((value: Expression) => {
            return createBoolean(value.type === ExpressionType.Number);
        }),
        abs: createProcedure((value: Expression) => {
            const params = [value];
            assertNumbers(params);
            return {
                type: ExpressionType.Number,
                value: Math.abs(params[0].value),
            };
        }),
    };

    const comparison: Scope = {
        "=": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);

            return createBoolean(
                Math.abs(params[0].value - params[1].value) <= Number.EPSILON
            );
        }),
        ">": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);

            return createBoolean(params[0].value > params[1].value);
        }),
        "<": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);

            return createBoolean(params[0].value < params[1].value);
        }),
        ">=": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);

            return createBoolean(params[0].value >= params[1].value);
        }),
        "<=": createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertNumbers(params);

            return createBoolean(params[0].value <= params[1].value);
        }),
    };

    const string: Scope = {
        append: createProcedure((left: Expression, right: Expression) => {
            const params = [left, right];
            assertStrings(params);

            return createString(params[0].value + params[1].value);
        }),
    };

    const logical: Scope = {
        not: createProcedure((...params: Expression[]) => {
            if (params.length !== 1) {
                throw new Error(
                    `"not" only accepts one argument, get ${params
                        .map((p) => format(p))
                        .join(", ")}`
                );
            }
            assertBoolean(params);

            return createBoolean(!params[0].value);
        }),
        and: createProcedure((...params: Expression[]) => {
            if (params.length === 0) {
                throw new Error(
                    `"and" accepts at least one argument, get ${params
                        .map((p) => format(p))
                        .join(", ")}`
                );
            }
            assertBoolean(params);
            return createBoolean(params.every((p) => p.value));
        }),
        or: createProcedure((...params: Expression[]) => {
            if (params.length === 0) {
                throw new Error(
                    `"or" accepts at least one argument, get ${params
                        .map((p) => format(p))
                        .join(", ")}`
                );
            }
            assertBoolean(params);

            return createBoolean(params.some((p) => p.value));
        }),
    };

    const list: Scope = {
        car: createProcedure((...params: Expression[]) => {
            assertList(params);
            if (params.length !== 1) {
                throw new Error(
                    `car accepts single argument, get ${format(params)}`
                );
            }

            if (params[0].items.length === 0) {
                throw new Error(
                    `car accepts non empty list, get ${format(params[0])}`
                );
            }

            return params[0].items[0];
        }),
        cdr: createProcedure((...params: Expression[]) => {
            assertList(params);
            if (params.length !== 1) {
                throw new Error(
                    `cdr accepts single argument, get ${format(params)}`
                );
            }

            if (params[0].items.length === 0) {
                throw new Error(
                    `cdr accepts non empty list, get ${format(params[0])}`
                );
            }

            return createList(params[0].items.slice(1));
        }),
        cons: createProcedure((...args: Expression[]) => {
            if (args.length !== 2) {
                throw new Error(
                    `cons expects 2 arguments, get ${args.length} ${format(
                        args
                    )}`
                );
            }
            if (args[1].type !== ExpressionType.List) {
                throw new Error(
                    `cons expect second argument to be list, get ${format(
                        args[1]
                    )}`
                );
            }
            return createList([args[0], ...args[1].items]);
        }),
        list: createProcedure((...args: Expression[]) => {
            return createList(args);
        }),
        "list?": createProcedure((value: Expression) => {
            return createBoolean(value.type === ExpressionType.List);
        }),
        length: createProcedure((value: Expression) => {
            const params = [value];
            assertList(params);
            if (params.length !== 1) {
                throw new Error(
                    `length accepts single argument, get ${format(params)}`
                );
            }

            return createNumber(params[0].items.length);
        }),
        "pair?": createProcedure((value: Expression) => {
            return createBoolean(
                value.type === ExpressionType.List && value.items.length > 0
            );
        }),
        "null?": createProcedure((value: Expression) => {
            return createBoolean(
                value.type === ExpressionType.List && value.items.length === 0
            );
        }),
    };

    const io: Scope = {
        /**
         * console.log received value
         */
        print: createProcedure((value: Expression) => {
            // TODO: format expression correctly
            console.log(format(value));
            return value;
        }),
    };

    const StandardLibrary: Scope = {
        ...arithmetic,
        ...comparison,
        ...string,
        ...logical,
        ...list,
        ...io,
        // apply: (proc: ExprValue, ...args: ExprValue[]) => {
        //     if (typeof proc !== "function") {
        //         throw new Error(
        //             `apply requires first parameter to be function, get ${format(
        //                 proc
        //             )}`
        //         );
        //     }
        //     if (args.length !== 1) {
        //         throw new Error(
        //             `apply accepts exactly two parameters, actual ${args.toString()}`
        //         );
        //     }
        //     if (!Array.isArray(args[0])) {
        //         throw new Error(
        //             `apply requires second parameter to be a list, actual ${format(
        //                 args[0]
        //             )}`
        //         );
        //     }
        //     return proc(...args[0]);
        // },
        begin: createProcedure((...args: Expression[]) => {
            if (args.length === 0) {
                throw new Error(
                    `begin accepts 1 argument at least, actual ${args.toString()}`
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return args.at(-1)!;
        }),
        // "pair?": (value: ExprValue) => {
        //     return Array.isArray(value) && !!(value[PairKey as any] as boolean);
        // },
        // // TODO: not sure of exact meaning now
        // "eq?": (left: ExprValue, right: ExprValue) => {
        //     return left === right;
        // },
        // "equal?": (left: ExprValue, right: ExprValue) => {
        //     return left === right;
        // },
        "procedure?": createProcedure((value: Expression) => {
            return createBoolean(value.type === ExpressionType.Procedure);
        }),
    };
    return StandardLibrary;
}
