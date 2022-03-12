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
	length: number;
};

type BooleanToken = {
	type: TokenType.Boolean;
	value: boolean;
	length: number;
};

type NullToken = {
	type: TokenType.Null;
	length: number;
};
type Token =
	| NullToken
	| {
			type: TokenType.LeftParenthesis;
			length: number;
	  }
	| {
			type: TokenType.RightParenthesis;
			length: number;
	  }
	| {
			type: TokenType.LeftSquareBracket;
			length: number;
	  }
	| {
			type: TokenType.RightSquareBracket;
			length: number;
	  }
	| {
			type: TokenType.Colon;
			length: number;
	  }
	| {
			type: TokenType.Comma;
			length: number;
	  }
	| StringToken
	| BooleanToken;

function isWhitespace(codePoint: number) {
	const whitespaceCodePoints = [" ", "\t", "\n", "\r"].map((c) =>
		c.codePointAt(0)
	);

	return whitespaceCodePoints.includes(codePoint);
}

class JSONParser {
	private index = 0;
	constructor(private readonly text: string) {
		this.codePoints = getStringCodePoints(text);
	}

	private readonly codePoints: number[];
	private codePointIndex = 0;

	skipWhitespace_() {
		for (let i = this.codePointIndex; i < this.codePoints.length; i++) {
			if (!isWhitespace(this.codePoints[i])) {
				this.codePointIndex = i;
				break;
			}
		}
	}

	peekChar() {
		return this.codePoints[this.codePointIndex];
	}

	advance_(offset: number) {
		this.codePointIndex = Math.min(
			this.codePointIndex + offset,
			this.codePoints.length
		);
	}

	skipWhitespace() {
		const whitespace = /^\s+/;
		const { length } = whitespace.exec(this.remainingInput) || {
			length: 0,
		};

		this.advance(length);

		this.skipWhitespace_();
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
			this.advance_(1);
		}
	}

	private get remainingInput() {
		return this.text.substring(this.index);
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

	private token: Token | null = null;

	doPeekToken(): Token {
		this.skipWhitespace();

		const { remainingInput } = this;

		const char = this.peekChar();

		switch (char) {
			case "n".codePointAt(0):
				this.consumeKeyword("null");
				return {
					type: TokenType.Null,
					length: 4,
				};
			case "t".codePointAt(0):
				this.consumeKeyword("true");
				return {
					type: TokenType.Boolean,
					value: true,
					length: 4,
				};
			case "f".codePointAt(0):
				this.consumeKeyword("false");
				return {
					type: TokenType.Boolean,
					value: false,
					length: 5,
				};
			case "{".codePointAt(0):
				this.consumeKeyword("{");
				return { type: TokenType.LeftParenthesis, length: 1 };
			case "}".codePointAt(0):
				this.consumeKeyword("}");
				return { type: TokenType.RightParenthesis, length: 1 };
			case "[".codePointAt(0):
				this.consumeKeyword("[");
				return { type: TokenType.LeftSquareBracket, length: 1 };
			case "]".codePointAt(0):
				this.consumeKeyword("]");
				return { type: TokenType.LeftSquareBracket, length: 1 };
			case ":".codePointAt(0):
				this.consumeKeyword(":");
				return { type: TokenType.Colon, length: 1 };
			case ",".codePointAt(0):
				this.consumeKeyword(",");
				return { type: TokenType.Comma, length: 1 };
		}

		if (/^"/.test(remainingInput)) {
			const stringPattern = /^"([^\\\n"]|\\.)*"/;
			const match = stringPattern.exec(remainingInput);
			const string = match![0];
			const raw = string.slice(1, string.length - 1);

			const disallowedCharacterRe = /[\u0000-\u001F]/;
			if (disallowedCharacterRe.test(raw)) {
				throw new Error(
					`controls characters U+0000 ~ U+001F are not allowed in string, input is ${raw}`
				);
			}

			const invalidSingleEscape = /\\[^\\"/bfnrtu]/;
			if (invalidSingleEscape.test(raw)) {
				throw new Error(`invalid escape sequence in ${raw}`);
			}

			this.advance_(string.length);
			// TODO: refactor
			return {
				type: TokenType.String,
				value: raw
					.replace('\\"', '"')
					.replace("\\\\", "\\")
					.replace("\\/", "/")
					.replace("\\b", "\b")
					.replace("\\f", "\f")
					.replace("\\n", "\n")
					.replace("\\r", "\r")
					.replace("\\t", "\t"),
				length: string.length,
			};
		} else {
			throw new Error(`unexpected input ${this.remainingInput}`);
		}
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
		this.advance(token.length);

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
				throw new Error(`unexpected input ${this.remainingInput}`);
		}
	}
}
