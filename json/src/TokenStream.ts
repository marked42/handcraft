import { CharacterStream, StringCharacterStream } from "./CharacterStream";
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

import { TokenOld, TokenType, StringTokenOld, NumberTokenOld } from "./Token";

export class TokenStream {
	private token: TokenOld | null = null;

	constructor(private readonly characterStream: CharacterStream) {}

	public get characterIndex() {
		return this.characterStream.codePointIndex;
	}

	peek(): TokenOld {
		if (!this.token) {
			this.token = this.doPeek();
		}

		return this.token;
	}

	// TODO: narrow down token type
	eat(type?: TokenType): TokenOld {
		const token = this.peek();
		if (type !== void 0) {
			this.expect(token, type);
		}

		this.token = null;

		return token;
	}

	private expect(token: TokenOld, tokenType: TokenType) {
		if (tokenType !== token.type) {
			throw new Error(
				`Unexpected token at position ${
					this.characterStream.codePointIndex
				} in JSON. Expect ${tokenType} but get ${JSON.stringify(token)}`
			);
		}
	}

	// @ts-ignore last statement throws so it's not needed to return anything, ts cannot infer this.
	private doPeek(): TokenOld {
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

	private reportInvalidToken(message: string = "") {
		throw new Error(
			`Invalid token character at position ${this.characterStream.codePointIndex} in JSON. ${message}`
		);
	}

	private parseStringToken(): StringTokenOld {
		const codePoints: number[] = [];

		if (!isSameCodePoint(this.characterStream.peek(), '"')) {
			throw new Error("expect string to begin with double quote");
		}
		this.characterStream.advance(1);

		while (true) {
			const char = this.characterStream.peek();

			if (isControlCharacter(char)) {
				this.reportInvalidToken(
					"Controls characters U+0000 ~ U+001F are not allowed in string."
				);
			}

			if (isSameCodePoint(char, "\n")) {
				this.reportInvalidToken(
					"Character newline is not allowed in string."
				);
			}

			if (isEOFCharacter(char)) {
				this.reportInvalidToken(
					"Early end of input is not allowed in string."
				);
			}

			if (isSameCodePoint(char, "\\")) {
				this.characterStream.advance(1);
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
					isSameCodePoint(this.characterStream.peek(), c)
				);

				if (typeof escape?.[1] === "string") {
					this.characterStream.advance(1);

					codePoints.push(escape[1].codePointAt(0)!);
				} else if (isSameCodePoint(this.characterStream.peek(), "u")) {
					this.characterStream.advance(1);

					const invalidUnicodeEscapeSequence = [0, 1, 2, 3].some(
						(i) => !isHexDigit(this.characterStream.peek(i))
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
					codePoints.push(codePoint);
				} else {
					this.reportInvalidToken(
						`Invalid single character escape sequence \\${String.fromCodePoint(
							this.characterStream.peek()
						)} is not allowed in string.`
					);
				}
			} else if (isSameCodePoint(char, '"')) {
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

	private parseNumberToken(): NumberTokenOld {
		let sign = 1;

		// minus sign
		if (isSameCodePoint(this.characterStream.peek(), "-")) {
			this.characterStream.advance(1);
			sign = -1;
		}

		// integral
		let integral = 0;
		if (isSameCodePoint(this.characterStream.peek(), "0")) {
			this.characterStream.advance(1);
		} else if (isDecimalDigitOneToNine(this.characterStream.peek())) {
			integral = getDecimalDigitMathematicalValue(
				this.characterStream.peek()
			);
			this.characterStream.advance(1);

			while (isDecimalDigit(this.characterStream.peek())) {
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

		// fraction
		let fractionDigitCount = 0;
		let fraction = 0;
		if (isSameCodePoint(this.characterStream.peek(), ".")) {
			this.characterStream.advance(1);

			if (!isDecimalDigit(this.characterStream.peek())) {
				this.reportInvalidToken(
					`Number fraction part cannot contain character ${this.characterStream.peek()}, only 0 ~ 9 are allowed.`
				);
			}

			while (isDecimalDigit(this.characterStream.peek())) {
				fractionDigitCount++;
				fraction =
					fraction +
					Math.pow(10, -fractionDigitCount) *
						getHexDigitMathematicalValue(
							this.characterStream.peek()
						);
				this.characterStream.advance(1);
			}
		}

		// exponent
		let exponent = 0;
		let exponentSign = 1;
		if (
			isSameCodePoint(this.characterStream.peek(), "e") ||
			isSameCodePoint(this.characterStream.peek(), "E")
		) {
			this.characterStream.advance(1);
			if (isSameCodePoint(this.characterStream.peek(), "+")) {
				exponentSign = 1;
				this.characterStream.advance(1);
			} else if (isSameCodePoint(this.characterStream.peek(), "-")) {
				exponentSign = -1;
				this.characterStream.advance(1);
			}

			if (!isDecimalDigit(this.characterStream.peek())) {
				this.reportInvalidToken(
					`Number exponent cannot contain character ${this.characterStream.peek()}.`
				);
			}

			while (isDecimalDigit(this.characterStream.peek())) {
				exponent =
					exponent * 10 +
					getDecimalDigitMathematicalValue(
						this.characterStream.peek()
					);
				this.characterStream.advance(1);
			}
		}

		const base = sign * (integral + fraction);
		return {
			type: TokenType.Number,
			value: base * Math.pow(10, exponentSign * exponent),
		};
	}
}
