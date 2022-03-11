export function parseJSON(text: string) {
	const parser = new JSONParser(text);

	return parser.parse();
}

class JSONParser {
	// private index = 0;
	constructor(private readonly text: string) {}

	// skipWhitespace() {
	// 	const whitespace = /^\s+/;
	// 	const { length } = whitespace.exec(this.text) || { length: 0 };

	// 	this.advance(length);
	// }

	// private get remainingInput() {
	// 	return this.text.substring(this.index);
	// }

	// private assertNonNegativeInteger(value: number) {
	// 	if (Number.isInteger(value) && value >= 0) {
	// 		return;
	// 	}

	// 	throw new Error(`${value} is not a non negative integer.`);
	// }

	// private advance(numberOfChars: number) {
	// 	this.assertNonNegativeInteger(numberOfChars);

	// 	this.index += numberOfChars;
	// }

	// nextToken() {
	// 	this.skipWhitespace();

	// 	const { remainingInput } = this;

	// 	if (/^null/.exec(remainingInput)) {
	// 		this.advance(4);
	// 		return null;
	// 	} else if (/^true/.exec(remainingInput)) {
	// 		this.advance(4);
	// 	}
	// }

	parse() {
		let { text } = this;

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

		const stringPattern = /^"([^\n"]|\\")*"$/;
		if (stringPattern.test(text)) {
			return text
				.slice(1, text.length - 1)
				.replace('\\"', '"')
				.replace("\\n", "\n")
				.replace("\\a", "a");
		}

		return {};
	}
}
