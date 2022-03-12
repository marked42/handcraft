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

class JSONParser {
	private index = 0;
	constructor(private readonly text: string) {}

	skipWhitespace() {
		const whitespace = /^\s+/;
		const { length } = whitespace.exec(this.remainingInput) || {
			length: 0,
		};

		this.advance(length);
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

	peekToken(): Token {
		this.skipWhitespace();

		const { remainingInput } = this;

		const stringPattern = /^"([^\\\n"]|\\(\\|\/|"|b|n|t|r|f))*"/;

		if (/^null/.exec(remainingInput)) {
			return {
				type: TokenType.Null,
				length: 4,
			};
		} else if (/^true/.exec(remainingInput)) {
			return { type: TokenType.Boolean, value: true, length: 4 };
		} else if (/^false/.exec(remainingInput)) {
			return { type: TokenType.Boolean, value: false, length: 5 };
		} else if (stringPattern.test(remainingInput)) {
			const match = stringPattern.exec(remainingInput);
			const string = match![0];

			const raw = string.slice(1, string.length - 1);

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
		} else if (remainingInput[0] === "{") {
			return { type: TokenType.LeftParenthesis, length: 1 };
		} else if (remainingInput[0] === "}") {
			return { type: TokenType.RightParenthesis, length: 1 };
		} else if (remainingInput[0] === "[") {
			return { type: TokenType.LeftSquareBracket, length: 1 };
		} else if (remainingInput[0] === "]") {
			return { type: TokenType.RightSquareBracket, length: 1 };
		} else if (remainingInput[0] === ":") {
			return { type: TokenType.Colon, length: 1 };
		} else if (remainingInput[0] === ",") {
			return { type: TokenType.Comma, length: 1 };
		} else {
			throw new Error(`unexpected input ${this.remainingInput}`);
		}
	}

	// TODO: narrow down token type
	consumeToken(type?: TokenType): Token {
		const token = this.peekToken();
		if (type !== void 0) {
			this.expectToken(token, type);
		}
		this.advance(token.length);

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
				throw new Error(`unexpected token ${token}`);
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

		return {};
	}
}
