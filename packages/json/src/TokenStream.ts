import { CharacterStream } from "./CharacterStream";
import {
	isControlCharacter,
	isEOFCharacter,
	isHexDigit,
	isSameCodePoint,
	getHexDigitsMathematicalValue,
	isDecimalDigit,
	isDecimalDigitOneToNine,
	getDecimalDigitMathematicalValue,
	getHexDigitMathematicalValue,
} from "./codePoints";
import { Token, TokenType, StringToken, NumberToken } from "./Token";

export class TokenStream {
	private token: Token | null = null;

	constructor(private readonly characterStream: CharacterStream) {}

	peek(): Token {
		if (!this.token) {
			this.token = this.doPeek();
		}

		return this.token;
	}

	// TODO: narrow down token type
	eat<T extends TokenType>(type?: T, message?: string): Token {
		if (type !== void 0) {
			this.expect(type, message);
		}

		const token = this.peek();
		this.token = null;

		return token;
	}

	match(type: TokenType) {
		return this.peek().type === type;
	}

	public expect(tokenType: TokenType, message?: string) {
		const token = this.peek();
		const fallbackMessage = `Expect ${tokenType} but get ${JSON.stringify(
			token
		)}`;

		if (tokenType !== token.type) {
			this.throwUnexpectedTokenError(message || fallbackMessage);
		}
	}

	public throwUnexpectedTokenError(message?: string) {
		throw new Error(
			`Unexpected token at position ${
				this.characterStream.codePointIndex
			} in JSON. ${message || ""}`
		);
	}

	private doPeek(): Token {
		this.characterStream.skipWhitespaceCharacters();

		const char = this.characterStream.peek();

		switch (char) {
			case "n".codePointAt(0):
				this.characterStream.eat("null");
				return {
					type: TokenType.Null,
				};

			case "t".codePointAt(0):
				this.characterStream.eat("true");
				return {
					type: TokenType.Boolean,
					value: true,
				};

			case "f".codePointAt(0):
				this.characterStream.eat("false");
				return {
					type: TokenType.Boolean,
					value: false,
				};

			case "{".codePointAt(0):
				this.characterStream.eat("{");
				return { type: TokenType.LeftParenthesis };

			case "}".codePointAt(0):
				this.characterStream.eat("}");
				return { type: TokenType.RightParenthesis };

			case "[".codePointAt(0):
				this.characterStream.eat("[");
				return { type: TokenType.LeftSquareBracket };

			case "]".codePointAt(0):
				this.characterStream.eat("]");
				return { type: TokenType.RightSquareBracket };

			case ":".codePointAt(0):
				this.characterStream.eat(":");
				return { type: TokenType.Colon };

			case ",".codePointAt(0):
				this.characterStream.eat(",");
				return { type: TokenType.Comma };

			case '"'.codePointAt(0):
				return this.parseStringToken();
		}

		const isNumberTokenStart = (char: number) => {
			return isDecimalDigit(char) || isSameCodePoint(char, "-");
		};

		if (isNumberTokenStart(char)) {
			return this.parseNumberToken();
		}

		if (isEOFCharacter(char)) {
			return { type: TokenType.EOF };
		}

		this.reportInvalidToken();
	}

	private reportInvalidToken(message = ""): never {
		throw new Error(
			`Invalid token character at position ${this.characterStream.codePointIndex} in JSON. ${message}`
		);
	}

	private parseStringToken(): StringToken {
		const codePoints: number[] = [];

		this.characterStream.expect(
			'"',
			"expect string to begin with double quote"
		);
		this.characterStream.advance(1);

		for (;;) {
			const char = this.characterStream.peek();

			if (isControlCharacter(char)) {
				this.reportInvalidToken(
					"Controls characters U+0000 ~ U+001F are not allowed in string."
				);
			}

			if (this.characterStream.match("\n")) {
				this.reportInvalidToken(
					"Character newline is not allowed in string."
				);
			}

			if (isEOFCharacter(char)) {
				this.reportInvalidToken(
					"Early end of input is not allowed in string."
				);
			}

			if (this.characterStream.match("\\")) {
				this.characterStream.advance(1);

				codePoints.push(this.parseEscapeSequence());
			} else if (this.characterStream.match('"')) {
				break;
			} else {
				// normal character
				codePoints.push(char);
				this.characterStream.advance(1);
			}
		}

		this.characterStream.advance(1);

		return {
			type: TokenType.String,
			// implicitly handles surrogate pair
			value: String.fromCodePoint(...codePoints),
		};
	}

	private parseEscapeSequence() {
		if (this.characterStream.match("u")) {
			this.characterStream.advance(1);

			return this.parseUnicodeEscapeSequence();
		}

		return this.parseSingleCharacterEscapeSequence();
	}

	private parseSingleCharacterEscapeSequence(): number {
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
			this.characterStream.match(c)
		);

		const cp = escape?.[1]?.codePointAt(0);
		if (typeof cp === "number") {
			this.characterStream.advance(1);

			return cp;
		}

		this.reportInvalidToken(
			`Invalid single character escape sequence \\${String.fromCodePoint(
				this.characterStream.peek()
			)} is not allowed in string.`
		);
	}

	private parseUnicodeEscapeSequence() {
		const invalidUnicodeEscapeSequence = [0, 1, 2, 3].some(
			(i) => !this.characterStream.match(isHexDigit, i)
		);
		const invalidSequence = [0, 1, 2, 3]
			.map((i) => this.characterStream.peek(i))
			.join("");
		if (invalidUnicodeEscapeSequence) {
			this.reportInvalidToken(
				`Invalid unicode escape sequence \\u${invalidSequence} is not allowed in string.`
			);
		}

		const codePoint = getHexDigitsMathematicalValue(
			this.characterStream.peek(0),
			this.characterStream.peek(1),
			this.characterStream.peek(2),
			this.characterStream.peek(3)
		);

		this.characterStream.advance(4);

		return codePoint;
	}

	private parseNumberToken(): NumberToken {
		const sign = this.parseNumberTokenMinusSign();
		const integral = this.parseNumberTokenIntegral();
		const fraction = this.parseNumberTokenFraction();
		const exponent = this.parseNumberTokenExponent();

		const base = sign * (integral + fraction);
		return {
			type: TokenType.Number,
			value: base * exponent,
		};
	}

	private parseNumberTokenMinusSign() {
		let sign = 1;

		// minus sign
		if (this.characterStream.match("-")) {
			this.characterStream.advance(1);
			sign = -1;
		}

		return sign;
	}

	private parseNumberTokenIntegral() {
		// integral
		let integral = 0;
		if (this.characterStream.match("0")) {
			this.characterStream.advance(1);
		} else if (this.characterStream.match(isDecimalDigitOneToNine)) {
			integral = getDecimalDigitMathematicalValue(
				this.characterStream.peek()
			);
			this.characterStream.advance(1);

			while (this.characterStream.match(isDecimalDigit)) {
				integral =
					integral * 10 +
					getDecimalDigitMathematicalValue(
						this.characterStream.peek()
					);
				this.characterStream.advance(1);
			}
		} else {
			this.reportInvalidToken(
				`Number integral part should not start with ${this.characterStream.peek()}, only 0 ~ 9 are allowed.`
			);
		}

		return integral;
	}

	private parseNumberTokenFraction() {
		let fractionDigitCount = 0;
		let fraction = 0;
		if (this.characterStream.match(".")) {
			this.characterStream.advance(1);

			if (!this.characterStream.match(isDecimalDigit)) {
				this.reportInvalidToken(
					`Number fraction part cannot contain character ${this.characterStream.peek()}, only 0 ~ 9 are allowed.`
				);
			}

			while (this.characterStream.match(isDecimalDigit)) {
				fractionDigitCount++;
				const significance = Math.pow(10, -fractionDigitCount);
				fraction +=
					significance *
					getHexDigitMathematicalValue(this.characterStream.peek());
				this.characterStream.advance(1);
			}
		}

		return fraction;
	}

	private parseNumberTokenExponent() {
		// exponent
		let exponent = 0;
		let sign = 1;
		if (
			this.characterStream.match("e") ||
			this.characterStream.match("E")
		) {
			this.characterStream.advance(1);
			if (this.characterStream.match("+")) {
				this.characterStream.advance(1);
			} else if (this.characterStream.match("-")) {
				sign = -1;
				this.characterStream.advance(1);
			}

			if (!this.characterStream.match(isDecimalDigit)) {
				this.reportInvalidToken(
					`Number exponent cannot contain character ${this.characterStream.peek()}.`
				);
			}

			while (this.characterStream.match(isDecimalDigit)) {
				exponent =
					exponent * 10 +
					getDecimalDigitMathematicalValue(
						this.characterStream.peek()
					);
				this.characterStream.advance(1);
			}
		}

		return Math.pow(10, exponent * sign);
	}
}
