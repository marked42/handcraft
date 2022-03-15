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

export type StringToken = {
	type: TokenType.String;
	value: string;
};

export type BooleanToken = {
	type: TokenType.Boolean;
	value: boolean;
};

export type NullToken = {
	type: TokenType.Null;
};

export type NumberToken = {
	type: TokenType.Number;
	value: number;
};

export type EOFToken = {
	type: TokenType.EOF;
};

export type Token =
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

export class TokenStream {
	private token: Token | null = null;
	private codePointIndex = 0;
	private readonly codePoints: number[] = [];

	constructor(public readonly text: string) {
		this.codePoints = getStringCodePoints(text);
	}

	skipWhitespace() {
		for (let i = this.codePointIndex; i < this.codePoints.length; i++) {
			if (!isWhitespace(this.codePoints[i])) {
				this.codePointIndex = i;
				break;
			}
		}
	}

	public get index() {
		return this.codePointIndex;
	}

	public set index(value: number) {
		this.codePointIndex = value;
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

	consumeKeyword(keyword: string) {
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

			if (isSameCodePoint(char, "\\")) {
				this.advanceChar(1);
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
				} else if (isSameCodePoint(this.peekChar(), "u")) {
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
				} else {
					throw new Error(
						`invalid single character escape sequence \\${String.fromCodePoint(
							this.peekChar()
						)}`
					);
				}
			} else if (isSameCodePoint(char, '"')) {
				break;
			} else {
				// normal character
				codePoints.push(char);
				this.advanceChar(1);
			}
		}

		this.advanceChar(1);

		return {
			type: TokenType.String,
			// implicitly handles surrogate pair
			value: String.fromCodePoint(...codePoints),
		};
	}

	peekNumberToken(): NumberToken {
		let sign = 1;

		// minus sign
		if (isSameCodePoint(this.peekChar(), "-")) {
			this.advanceChar(1);
			sign = -1;
		}

		// integral
		let integral = 0;
		if (isSameCodePoint(this.peekChar(), "0")) {
			this.advanceChar(1);
		} else if (isDecimalDigitOneToNine(this.peekChar())) {
			integral = getDecimalDigitMathematicalValue(this.peekChar());
			this.advanceChar(1);

			while (isDecimalDigit(this.peekChar())) {
				integral =
					integral * 10 +
					getDecimalDigitMathematicalValue(this.peekChar());
				this.advanceChar(1);
			}
		} else {
			throw new Error(
				`unexpected number token at index ${this.codePointIndex} in ${this.text}`
			);
		}

		// fraction
		let fractionDigitCount = 0;
		let fraction = 0;
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
						getHexDigitMathematicalValue(this.peekChar());
				this.advanceChar(1);
			}
		}

		// exponent
		let exponent = 0;
		let exponentSign = 1;
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
					getDecimalDigitMathematicalValue(this.peekChar());
				this.advanceChar(1);
			}
		}

		const base = sign * (integral + fraction);
		return {
			type: TokenType.Number,
			value: base * Math.pow(10, exponentSign * exponent),
		};
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

	peekToken(): Token {
		if (!this.token) {
			this.token = this.doPeekToken();
		}

		return this.token;
	}
}
