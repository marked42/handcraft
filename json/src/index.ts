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

type Token =
	| {
			type: TokenType.Null;
	  }
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
	| {
			type: TokenType.Boolean;
			value: boolean;
	  };

class JSONParser {
	private index = 0;
	constructor(private readonly text: string) {}

	skipWhitespace() {
		const whitespace = /^\s+/;
		const { length } = whitespace.exec(this.text) || { length: 0 };

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

	nextToken(): Token {
		this.skipWhitespace();

		const { remainingInput } = this;

		const stringPattern = /^"([^\n"]|\\")*"$/;

		if (/^null/.exec(remainingInput)) {
			this.advance(4);
			return {
				type: TokenType.Null,
			};
		} else if (/^true/.exec(remainingInput)) {
			this.advance(4);
			return { type: TokenType.Boolean, value: true };
		} else if (/^false/.exec(remainingInput)) {
			this.advance(5);
			return { type: TokenType.Boolean, value: false };
		} else if (stringPattern.test(this.text)) {
			this.advance(this.text.length);

			return {
				type: TokenType.String,
				value: this.text
					.slice(1, this.text.length - 1)
					.replace('\\"', '"')
					.replace("\\n", "\n")
					.replace("\\a", "a"),
			};
		} else if (remainingInput[0] === "{") {
			return { type: TokenType.LeftParenthesis };
		} else if (remainingInput[0] === "}") {
			return { type: TokenType.RightParenthesis };
		} else if (remainingInput[0] === "[") {
			return { type: TokenType.LeftSquareBracket };
		} else if (remainingInput[0] === "]") {
			return { type: TokenType.RightSquareBracket };
		} else if (remainingInput[0] === ":") {
			return { type: TokenType.Colon };
		} else if (remainingInput[0] === ",") {
			return { type: TokenType.Comma };
		} else {
			throw new Error(`unexpected input ${this.remainingInput}`);
		}
	}

	expectToken(token: Token, tokenType: TokenType) {
		if (tokenType !== token.type) {
			throw new Error(`unexpected token type ${tokenType}`);
		}
	}

	parseObject(token: Token) {
		this.expectToken(token, TokenType.LeftParenthesis);
		return {};
	}

	parseString(token: Token) {
		this.expectToken(token, TokenType.String);

		// TODO: expectToken should narrow token to StringToken type
		return (token as StringToken).value;
	}

	parse() {
		const token = this.nextToken();

		switch (token.type) {
			case TokenType.Boolean:
				return token.value;
			case TokenType.Null:
				return null;
			case TokenType.String:
				return this.parseString(token);
			case TokenType.LeftParenthesis:
				return this.parseObject(token);
			default:
				throw new Error(`unexpected input ${this.remainingInput}`);
		}

		return {};
	}
}
