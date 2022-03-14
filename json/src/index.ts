import {
	isControlCharacter,
	isEOFCharacter,
	isHexDigit,
	isSameCodePoint,
	isWhitespace,
	CHAR_EOF,
	getHexDigitsMathematicalValue,
	getStringCodePoints,
	isDecimalDigit,
	isDecimalDigitOneToNine,
	getDecimalDigitMathematicalValue,
	getHexDigitMathematicalValue,
} from "./codePoints";

export function parseJSON(text: string) {
	const parser = new JSONParser(text);

	return parser.parse();
}

// TODO: use class instead of union types
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
	EOF,
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

type NumberToken = {
	type: TokenType.Number;
	value: number;
};

type EOFToken = {
	type: TokenType.EOF;
};

type Token =
	| NullToken
	| EOFToken
	| NumberToken
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

				const invalidUnicodeEscapeSequence = [0, 1, 2, 3].some(
					(i) => !isHexDigit(this.peekChar(i))
				);
				if (invalidUnicodeEscapeSequence) {
					throw new Error(
						`invalid unicode escape sequence at index ${this.codePointIndex} in ${this.text}`
					);
				}

				const codePoint = getHexDigitsMathematicalValue(
					this.peekChar(0),
					this.peekChar(1),
					this.peekChar(2),
					this.peekChar(3)
				);

				this.advanceChar(4);
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
			// implicitly handles surrogate pair
			value: String.fromCodePoint(...codePoints),
		};
	}

	peekNumberToken(): NumberToken {
		let sign = 1;
		let integral = 0;
		let fractionDigitCount = 0;
		let fraction = 0;
		let exponent = 0;
		let exponentSign = 1;

		if (isSameCodePoint(this.peekChar(), "-")) {
			this.advanceChar(1);
			sign = -1;
		}

		enum State {
			IntegralStart,
			FractionStart,
			ExponentialStart,
			Stopped,
		}

		let state = State.IntegralStart;
		do {
			switch (state) {
				case State.IntegralStart:
					if (isSameCodePoint(this.peekChar(), "0")) {
						this.advanceChar(1);
						state = State.FractionStart;
					} else if (isDecimalDigitOneToNine(this.peekChar())) {
						integral = getDecimalDigitMathematicalValue(
							this.peekChar()
						);
						this.advanceChar(1);

						while (isDecimalDigit(this.peekChar())) {
							integral =
								integral * 10 +
								getDecimalDigitMathematicalValue(
									this.peekChar()
								);
							this.advanceChar(1);
						}
						state = State.FractionStart;
					} else {
						throw new Error(
							`unexpected number token at index ${this.codePointIndex} in ${this.text}`
						);
					}
					break;
				case State.FractionStart:
					if (isSameCodePoint(this.peekChar(), ".")) {
						this.advanceChar(1);

						if (!isDecimalDigit(this.peekChar())) {
							throw new Error("unexpected number token");
						}

						while (isDecimalDigit(this.peekChar())) {
							fractionDigitCount++;
							fraction =
								fraction +
								Math.pow(10, -fractionDigitCount) *
									getHexDigitMathematicalValue(
										this.peekChar()
									);
							this.advanceChar(1);
						}
					}

					state = State.ExponentialStart;
					break;
				case State.ExponentialStart:
					if (
						isSameCodePoint(this.peekChar(), "e") ||
						isSameCodePoint(this.peekChar(), "E")
					) {
						this.advanceChar(1);
						if (isSameCodePoint(this.peekChar(), "+")) {
							exponentSign = 1;
							this.advanceChar(1);
						} else if (isSameCodePoint(this.peekChar(), "-")) {
							exponentSign = -1;
							this.advanceChar(1);
						}

						if (!isDecimalDigit(this.peekChar())) {
							throw new Error(
								`unexpected number token at index ${this.codePointIndex}, input ${this.text}`
							);
						}

						while (isDecimalDigit(this.peekChar())) {
							exponent =
								exponent * 10 +
								getDecimalDigitMathematicalValue(
									this.peekChar()
								);
							this.advanceChar(1);
						}
					}
					state = State.Stopped;
					break;
			}
		} while (state !== State.Stopped);

		const base = sign * (integral + fraction);
		return {
			type: TokenType.Number,
			value: base * Math.pow(10, exponentSign * exponent),
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
				return { type: TokenType.RightSquareBracket };
			case ":".codePointAt(0):
				this.consumeKeyword(":");
				return { type: TokenType.Colon };
			case ",".codePointAt(0):
				this.consumeKeyword(",");
				return { type: TokenType.Comma };

			case '"'.codePointAt(0):
				return this.peekStringToken();
		}

		const isNumberTokenStart = (char: number) => {
			return isDecimalDigit(char) || isSameCodePoint(char, "-");
		};

		if (isNumberTokenStart(char)) {
			return this.peekNumberToken();
		}

		if (isEOFCharacter(char)) {
			return { type: TokenType.EOF };
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
				const value = this.parseValue();

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

	parseArray() {
		this.consumeToken(TokenType.LeftSquareBracket);
		// TODO: json value typing
		const result: any[] = [];

		if (this.peekToken().type === TokenType.RightSquareBracket) {
			this.consumeToken();
			return result;
		}

		while (true) {
			const element = this.parseValue();
			result.push(element);

			if (this.peekToken().type === TokenType.Comma) {
				this.consumeToken();
				continue;
			}

			if (this.peekToken().type === TokenType.RightSquareBracket) {
				this.consumeToken();
				break;
			}

			throw new Error(`unexpected token ${this.peekToken()}`);
		}

		return result;
	}

	parseNumber() {
		// TODO: type narrowing
		const token = this.consumeToken(TokenType.Number) as NumberToken;

		return token.value;
	}

	/**
	 * 为了处理单个数字是非法的情况 00
	 * 区分parse和parseValue，
	 * parseValue解析成功后，后续还可以有输入
	 * parse解析成功后，输入必须完结
	 *
	 * 一个token那个字符开始到那个字符结束
	 * 1. 最长规则？
	 * 2. 错误形式，明确token边界的话方便检测错误形式，给出友好的报错信息
	 *
	 * 考虑非递归实现，迭代实现中，如果解析结束后，栈内有多个json值，则输入非法
	 */
	parse() {
		const value = this.parseValue();

		this.skipWhitespace();

		if (this.peekToken().type !== TokenType.EOF) {
			throw new Error(
				`unexpected token at index ${this.codePointIndex}, input should end here`
			);
		}

		return value;
	}

	parseValue() {
		const token = this.peekToken();

		// TODO: typing JSON
		let value: any;
		switch (token.type) {
			case TokenType.Boolean:
				value = this.parseBoolean();
				break;

			case TokenType.Null:
				value = this.parseNull();
				break;

			case TokenType.String:
				value = this.parseString();
				break;

			case TokenType.LeftParenthesis:
				value = this.parseObject();
				break;

			case TokenType.LeftSquareBracket:
				value = this.parseArray();
				break;

			case TokenType.Number:
				value = this.parseNumber();
				break;

			default:
				throw new Error(
					`unexpected input ${this.text} at index ${this.codePointIndex}`
				);
		}

		return value;
	}
}
