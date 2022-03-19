import { JSONValue } from "./JSONValue";

export class JSONPrinter {
	print(value: JSONValue): string {
		if (value === null) {
			return "null";
		} else if (typeof value === "number") {
			return value.toString();
		} else if (typeof value === "string") {
			return `"${value}"`;
		} else if (typeof value === "boolean") {
			return String(value);
		} else if (Array.isArray(value)) {
			return `[${value.map((e) => this.print(e)).join(", ")}]`;
		} else if (typeof value === "object") {
			const pairs: string = Object.entries(value)
				.map(
					([key, value]) => `${this.print(key)}: ${this.print(value)}`
				)
				.join(", ");

			return `{${pairs}}`;
		}

		throw new Error(`invalid json value`);
	}
}
