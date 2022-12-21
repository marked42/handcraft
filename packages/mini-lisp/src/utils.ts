import { Expression } from "./parser";

// TODO: refactor
export function format(value: Expression | Expression[]): string {
    if (Array.isArray(value)) {
        return value.map((e) => format(e)).join(", ");
    }
    return JSON.stringify(value, null, 2);
}
