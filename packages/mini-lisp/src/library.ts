import { ExprValue, Scope } from "../src";

export const StandardLibrary: Scope = {
    "+": (left: ExprValue, right: ExprValue) => {
        // TODO: duplication
        // ts function supports only single predicate
        if (typeof left === "number" && typeof right === "number") {
            return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
            return left + right;
        }

        throwInvalidOperandsError("+", ["string", "number"], [left, right]);
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
    first: (value: ExprValue) => {
        if (!Array.isArray(value)) {
            throw new Error(
                `first applied to invalid value ${value.toString()}`
            );
        }
        return value[0];
    },
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
