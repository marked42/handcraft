export function parseJSON(text: string) {
	const whitespace = /^\s*(?<trimmed>\S+)\s*$/;

	const match = whitespace.exec(text);
	text = match?.groups?.["trimmed"] || text;

	if (text === "null") {
		return null;
	}

	if (text === "true") {
		return true;
	}

	if (text === "false") {
		return false;
	}

	return {};
}

class JSONParser {
	private index = 0;
	constructor(private readonly input: string) {}

	skipWhitespace() {
		const whitespace = /^\s+/;
		const { length } = whitespace.exec(this.input) || { length: 0 };

		this.advance(length);
	}

	private get remainingInput() {
		return this.input.substring(this.index);
	}

	private assertNonNegativeInteger(value: number) {
		if (Number.isInteger(value) && value >= 0) {
			return;
		}

		throw new Error(`${value} is not a non negative integer.`);
	}

	private advance(numberOfChars: number) {
		this.assertNonNegativeInteger(numberOfChars);

		this.index += numberOfChars;
	}

	nextToken() {
		this.skipWhitespace();

		const { remainingInput } = this;

		if (/^null/.exec(remainingInput)) {
			this.advance(4);
			return null;
		} else if (/^true/.exec(remainingInput)) {
			this.advance(4);
		}
	}
}
