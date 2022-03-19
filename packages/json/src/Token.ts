export type Token =
	| NullToken
	| EOFToken
	| NumberToken
	| StringToken
	| PunctuatorToken
	| BooleanToken;

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

// TODO: pick expected token type
// type PickToken<T extends TokenType> = TokenOld extends { type: T }
// 	? TokenOld
// 	: never;

export type PunctuatorToken =
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
	  };
