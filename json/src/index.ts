import { getStringCodePoints } from "./getStringCodePoints";

export function parseJSON(text: string) {
	const parser = new JSONParser(text);

	return parser.parse();
}

export enum TokenType {
	Null,
	Boolean,
	Number,
	String,
	LeftParenthesis,
	RightParenthesis,
	LeftSquareBracket,
	RightSquareBracket,
	Comma,
	Colon,
}

type StringToken = {
	type: TokenType.String;
	value: string;
};

type BooleanToken = {
	type: TokenType.Boolean;
	value: boolean;
};

type NullToken = {
	type: TokenType.Null;
};
type Token =
	| NullToken
	| {
			type: TokenType.LeftParenthesis;
	  }
	| {
			type: TokenType.RightParenthesis;
	  }
	| {
			type: TokenType.LeftSquareBracket;
	  }
	| {
			type: TokenType.RightSquareBracket;
	  }
	| {
			type: TokenType.Colon;
	  }
	| {
			type: TokenType.Comma;
	  }
	| StringToken
	| BooleanToken;

function isWhitespace(codePoint: number) {
	const whitespaceCodePoints = [" ", "\t", "\n", "\r"].map((c) =>
		c.codePointAt(0)
	);

	return whitespaceCodePoints.includes(codePoint);
}

function isControlCharacter(codePoint: number) {
	const min = 0x0000;
	const max = 0x001f;

	return min <= codePoint && codePoint <= max;
}

function isSameCodePoint(codePoint: number, str: string, index: number = 0) {
	const char = str.codePointAt(index);
	if (char === void 0) {
		throw new Error(`string ${str} has no code point at index ${index}`);
	}

	return codePoint === char;
}

function isDecimalDigit(codePoint: number) {
	const min = "0".codePointAt(0)!;
	const max = "9".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

function containsCodePoint(
	codePointRange: [number, number],
	codePoint: number
) {
	const [min, max] = codePointRange;

	return min <= codePoint && codePoint <= max;
}

function isLowerCaseAToF(codePoint: number) {
	const min = "a".codePointAt(0)!;
	const max = "f".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

function isUpperCaseAToF(codePoint: number) {
	const min = "a".codePointAt(0)!;
	const max = "f".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

function isHexDigit(codePoint: number) {
	return (
		isDecimalDigit(codePoint) ||
		isLowerCaseAToF(codePoint) ||
		isUpperCaseAToF(codePoint)
	);
}

export const CHAR_EOF = -1;

function isEOFCharacter(codePoint: number) {
	return CHAR_EOF === codePoint;
}

class JSONParser {
	constructor(private readonly text: string) {
		this.codePoints = getStringCodePoints(text);
	}

	private readonly codePoints: number[];
	private codePointIndex = 0;

	skipWhitespace() {
		for (let i = this.codePointIndex; i < this.codePoints.length; i++) {
			if (!isWhitespace(this.codePoints[i])) {
				this.codePointIndex = i;
				break;
			}
		}
	}

	peekChar(offset = 0) {
		const index = this.codePointIndex + offset;

		return index < this.codePoints.length
			? this.codePoints[index]
			: CHAR_EOF;
	}

	advanceChar(offset: number) {
		this.codePointIndex = Math.min(
			this.codePointIndex + offset,
			this.codePoints.length
		);
	}

	private consumeKeyword(keyword: string) {
		if (typeof keyword !== "string" || !keyword.length) {
			throw new Error(`expect non empty string, get ${keyword}`);
		}

		for (const c of keyword) {
			if (this.peekChar() !== c.charCodeAt(0)) {
				throw new Error(
					`unexpected keyword at index ${this.codePointIndex} from input ${this.text}`
				);
			}
			this.advanceChar(1);
		}
	}

	private assertNonNegativeInteger(value: number) {
		if (Number.isInteger(value) && value >= 0) {
			return;
		}

		throw new Error(`${value} is not a non negative integer.`);
	}

	private token: Token | null = null;

	peekStringToken(): StringToken {
		const codePoints: number[] = [];

		if (!isSameCodePoint(this.peekChar(), '"')) {
			throw new Error("expect string to begin with double quote");
		}
		this.advanceChar(1);

		while (true) {
			const char = this.peekChar();

			if (isControlCharacter(char)) {
				throw new Error(
					`controls characters U+0000 ~ U+001F are not allowed in string, at index ${this.codePointIndex}`
				);
			}

			if (isSameCodePoint(char, "\n")) {
				throw new Error(
					`newline character is not allowed in string, at index ${this.codePointIndex}`
				);
			}

			if (isEOFCharacter(char)) {
				throw new Error(
					`unexpected end-of-file when parsing string from input ${this.text}`
				);
			}

			this.advanceChar(1);
			if (isSameCodePoint(char, "\\")) {
				const validSingleEscape = [
					['"', '"'],
					["\\", "\\"],
					["/", "/"],
					["b", "\b"],
					["f", "\f"],
					["r", "\r"],
					["n", "\n"],
					["t", "\t"],
				];

				const escape = validSingleEscape.find(([c]) =>
					isSameCodePoint(this.peekChar(), c)
				);

				if (typeof escape?.[1] === "string") {
					this.advanceChar(1);

					codePoints.push(escape[1].codePointAt(0)!);
					continue;
				}

				if (!isSameCodePoint(this.peekChar(), "u")) {
					throw new Error(
						`invalid single character escape sequence \\${String.fromCodePoint(
							this.peekChar()
						)}`
					);
				}
				this.advanceChar(1);

				const invalidUnicodeEscapeSequence = [0, 1, 2, 3].some((i) =>
					isHexDigit(this.peekChar(i))
				);
				if (invalidUnicodeEscapeSequence) {
					throw new Error(
						`invalid unicode escape sequence at index ${this.codePointIndex} in ${this.text}`
					);
				}

				const codePoint =
					0x1000 * this.peekChar(0) +
					0x0100 * this.peekChar(1) +
					0x0010 * this.peekChar(2) +
					0x0001 * this.peekChar(3);

				this.advanceChar(3);
				codePoints.push(codePoint);
				continue;
			}

			if (isSameCodePoint(char, '"')) {
				break;
			} else {
				// normal character
				codePoints.push(char);
			}
		}

		return {
			type: TokenType.String,
			value: String.fromCodePoint(...codePoints),
		};
	}

	doPeekToken(): Token {
		this.skipWhitespace();

		const char = this.peekChar();

		switch (char) {
			case "n".codePointAt(0):
				this.consumeKeyword("null");
				return {
					type: TokenType.Null,
				};
			case "t".codePointAt(0):
				this.consumeKeyword("true");
				return {
					type: TokenType.Boolean,
					value: true,
				};
			case "f".codePointAt(0):
				this.consumeKeyword("false");
				return {
					type: TokenType.Boolean,
					value: false,
				};
			case "{".codePointAt(0):
				this.consumeKeyword("{");
				return { type: TokenType.LeftParenthesis };
			case "}".codePointAt(0):
				this.consumeKeyword("}");
				return { type: TokenType.RightParenthesis };
			case "[".codePointAt(0):
				this.consumeKeyword("[");
				return { type: TokenType.LeftSquareBracket };
			case "]".codePointAt(0):
				this.consumeKeyword("]");
				return { type: TokenType.LeftSquareBracket };
			case ":".codePointAt(0):
				this.consumeKeyword(":");
				return { type: TokenType.Colon };
			case ",".codePointAt(0):
				this.consumeKeyword(",");
				return { type: TokenType.Comma };

			case '"'.codePointAt(0):
				return this.peekStringToken();
		}

		throw new Error(`unexpected input ${this.text}`);
	}

	peekToken(): Token {
		if (!this.token) {
			this.token = this.doPeekToken();
		}

		return this.token;
	}

	clearToken() {
		this.token = null;
	}

	// TODO: narrow down token type
	consumeToken(type?: TokenType): Token {
		const token = this.peekToken();
		if (type !== void 0) {
			this.expectToken(token, type);
		}

		this.clearToken();

		return token;
	}

	expectToken(token: Token, tokenType: TokenType) {
		if (tokenType !== token.type) {
			throw new Error(
				`expected token type ${tokenType}, get token ${JSON.stringify(
					token
				)}`
			);
		}
	}

	parseObject() {
		const token = this.consumeToken(TokenType.LeftParenthesis);
		const object: Record<string, any> = {};

		if (this.peekToken().type === TokenType.RightParenthesis) {
			this.consumeToken();
			return object;
		}

		while (true) {
			const nextToken = this.peekToken();
			if (nextToken.type === TokenType.String) {
				this.consumeToken();
				this.consumeToken(TokenType.Colon);
				const value = this.parse();

				object[nextToken.value] = value;

				if (this.peekToken().type === TokenType.Comma) {
					this.consumeToken();
				} else {
					break;
				}
			} else {
				throw new Error(`unexpected token ${JSON.stringify(token)}`);
			}
		}

		this.consumeToken(TokenType.RightParenthesis);

		return object;
	}

	parseString() {
		const token = this.consumeToken(TokenType.String);

		// TODO: expectToken should narrow token to StringToken type
		return (token as StringToken).value;
	}

	parseBoolean() {
		const token = this.consumeToken(TokenType.Boolean);

		return (token as BooleanToken).value;
	}

	parseNull() {
		this.consumeToken(TokenType.Null);

		return null;
	}

	parse() {
		const token = this.peekToken();

		switch (token.type) {
			case TokenType.Boolean:
				return this.parseBoolean();

			case TokenType.Null:
				return this.parseNull();

			case TokenType.String:
				return this.parseString();

			case TokenType.LeftParenthesis:
				return this.parseObject();

			default:
				throw new Error(
					`unexpected input ${this.text} at index ${this.codePointIndex}`
				);
		}
	}
}
