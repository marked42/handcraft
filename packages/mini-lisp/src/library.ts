import { Scope } from "./context";
import {
    createBoolean,
    createNumber,
    createProcedure,
    createString,
    Expression,
    ExpressionType,
    NumberExpression,
    StringExpression,
} from "./parser";

// const PairKey = Symbol();

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
        `arguments must be numbers, get ${args.map(format).join(", ")}`
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

    const StandardLibrary: Scope = {
        ...arithmetic,
        ...comparison,
        ...string,
        // not: (value: ExprValue) => {
        //     return !value;
        // },
        // "null?": (value: ExprValue) => {
        //     return value === undefined;
        // },
        // print: (...args: ExprValue[]) => {
        //     console.log(...args);
        //     // FIXME: should return null
        //     return args;
        // },
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
        // begin: (...args: ExprValue[]) => {
        //     if (args.length === 0) {
        //         throw new Error(
        //             `begin accepts 1 argument at least, actual ${args.toString()}`
        //         );
        //     }
        //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //     return args.at(-1)!;
        // },
        // car: (value: ExprValue) => {
        //     if (!Array.isArray(value)) {
        //         throw new Error(
        //             `car applied to invalid value ${format(value)}`
        //         );
        //     }
        //     return value[0];
        // },
        // cdr: (value: ExprValue) => {
        //     if (!Array.isArray(value)) {
        //         throw new Error(
        //             `cdr applied to invalid value ${format(value)}`
        //         );
        //     }
        //     return value.slice(1);
        // },
        // cons: (first: ExprValue, second: ExprValue) => {
        //     const pair = [first, second];
        //     Object.defineProperty(pair, PairKey, {
        //         get value() {
        //             return true;
        //         },
        //     });
        //     return pair;
        // },
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
        // list: (...args: ExprValue[]) => {
        //     return args;
        // },
        // "list?": (value: ExprValue) => {
        //     return Array.isArray(value);
        // },
        // length: (value: ExprValue) => {
        //     if (Array.isArray(value)) {
        //         return value.length;
        //     }
        //     throw new Error(
        //         `length must applies to a list or pair, received ${format(
        //             value
        //         )}`
        //     );
        // },
        // "procedure?": (value: ExprValue) => {
        //     return typeof value === "function";
        // },
        // TODO: symbol
    };
    return StandardLibrary;
}

function format(value: Expression) {
    return value ? value.toString() : "undefined";
}
