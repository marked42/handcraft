import { ExprValue, Scope } from "../src";

export const StandardLibrary: Scope = {
    "+": (left: ExprValue, right: ExprValue) => {
        if (typeof left === "number" && typeof right === "number") {
            return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
            return left + right;
        }

        throw new Error("add only valid on string/number");
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
