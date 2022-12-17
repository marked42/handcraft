import { ExprValue, Scope } from "../src";

const PairKey = Symbol();

export const StandardLibrary: Scope = {
    "+": (left: ExprValue, right: ExprValue) => {
        // TODO: duplication
        // ts function supports only single predicate
        if (typeof left === "number" && typeof right === "number") {
            return left + right;
        }

        throwInvalidOperandsError("+", ["string", "number"], [left, right]);
    },
    expt: (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return Math.pow(left, right);
        }

        throwInvalidOperandsError("expt", ["number"], [left, right]);
    },
    max: (...args: ExprValue[]) => {
        if (isNumbers(args)) {
            return Math.max(...args);
        }

        throwInvalidOperandsError("max", ["number"], args);
    },
    min: (...args: ExprValue[]) => {
        if (isNumbers(args)) {
            return Math.min(...args);
        }

        throwInvalidOperandsError("min", ["number"], args);
    },
    round: (value: ExprValue) => {
        if (typeof value === "number") {
            return Math.round(value);
        }

        throwInvalidOperandsError("round", ["number"], [value]);
    },
    not: (value: ExprValue) => {
        return !value;
    },
    "null?": (value: ExprValue) => {
        return value === undefined;
    },
    "number?": (value: ExprValue) => {
        return typeof value === "number";
    },
    print: (...args: ExprValue[]) => {
        console.log(...args);
        // FIXME: should return null
        return args;
    },
    "-": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left - right;
        }

        throwInvalidOperandsError("-", ["number"], [left, right]);
    },
    "*": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left * right;
        }

        throwInvalidOperandsError("*", ["number"], [left, right]);
    },
    "/": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left / right;
        }

        throwInvalidOperandsError("/", ["number"], [left, right]);
    },
    "=": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left === right;
        }

        throwInvalidOperandsError(">", ["number"], [left, right]);
    },
    ">": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left > right;
        }

        throwInvalidOperandsError(">", ["number"], [left, right]);
    },
    ">=": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left >= right;
        }

        throwInvalidOperandsError(">=", ["number"], [left, right]);
    },
    "<": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left < right;
        }

        throwInvalidOperandsError("<", ["number"], [left, right]);
    },
    "<=": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left <= right;
        }

        throwInvalidOperandsError(">", ["number"], [left, right]);
    },
    abs: (left: ExprValue) => {
        if (typeof left === "number") {
            return Math.abs(left);
        }

        throwInvalidOperandsError(">", ["number"], [left]);
    },
    apply: (proc: ExprValue, ...args: ExprValue[]) => {
        if (typeof proc !== "function") {
            throw new Error(
                `apply requires first parameter to be function, get ${proc.toString()}`
            );
        }
        if (args.length !== 1) {
            throw new Error(
                `apply accepts exactly two parameters, actual ${args.toString()}`
            );
        }
        if (!Array.isArray(args[0])) {
            throw new Error(
                `apply requires second parameter to be a list, actual ${args[0].toString()}`
            );
        }
        return proc(...args[0]);
    },
    begin: (...args: ExprValue[]) => {
        if (args.length === 0) {
            throw new Error(
                `begin accepts 1 argument at least, actual ${args.toString()}`
            );
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return args.at(-1)!;
    },
    append: (left: ExprValue, right: ExprValue) => {
        if (typeof left === "string" && typeof right === "string") {
            return left + right;
        }

        throwInvalidOperandsError("append", ["string"], [left, right]);
    },
    car: (value: ExprValue) => {
        if (!Array.isArray(value)) {
            throw new Error(`car applied to invalid value ${value.toString()}`);
        }
        return value[0];
    },
    cdr: (value: ExprValue) => {
        if (!Array.isArray(value)) {
            throw new Error(`cdr applied to invalid value ${value.toString()}`);
        }
        return value.slice(1);
    },
    cons: (first: ExprValue, second: ExprValue) => {
        const pair = [first, second];

        Object.defineProperty(pair, PairKey, {
            get value() {
                return true;
            },
        });

        return pair;
    },
    "pair?": (value: ExprValue) => {
        return Array.isArray(value) && !!(value[PairKey as any] as boolean);
    },
    // TODO: not sure of exact meaning now
    "eq?": (left: ExprValue, right: ExprValue) => {
        return left === right;
    },
    "equal?": (left: ExprValue, right: ExprValue) => {
        return left === right;
    },
    list: (...args: ExprValue[]) => {
        return args;
    },
    "list?": (value: ExprValue) => {
        return Array.isArray(value);
    },
    length: (value: ExprValue) => {
        if (Array.isArray(value)) {
            return value.length;
        }
        throw new Error(
            `length must applies to a list or pair, received ${value.toString()}`
        );
    },
    "procedure?": (value: ExprValue) => {
        return typeof value === "function";
    },
    // TODO: symbol
};

function throwInvalidOperandsError(
    op: string,
    validOperands: string[],
    actualOperands: ExprValue[]
): never {
    throw new Error(
        `operator '${op}' is valid only for ${validOperands.join(
            "/"
        )}, received (${op} ${actualOperands
            .map((e) => e.toString())
            .join(" ")})`
    );
}

function isNumbers(args: ExprValue[]): args is number[] {
    if (
        Array.isArray(args) &&
        args.length > 0 &&
        args.every((arg) => typeof arg === "number")
    ) {
        return true;
    }
    return false;
}
