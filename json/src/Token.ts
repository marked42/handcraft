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

export type StringTokenOld = {
	type: TokenType.String;
	value: string;
};

export type BooleanTokenOld = {
	type: TokenType.Boolean;
	value: boolean;
};

export type NullTokenOld = {
	type: TokenType.Null;
};

export type NumberTokenOld = {
	type: TokenType.Number;
	value: number;
};

export type EOFTokenOld = {
	type: TokenType.EOF;
};

export type TokenOld =
	| NullTokenOld
	| EOFTokenOld
	| NumberTokenOld
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
	| StringTokenOld
	| BooleanTokenOld;

export abstract class Token {
	constructor(protected readonly source: string) {}
}

// TODO: 如何设计Token的类关系
export class KeywordToken extends Token {
	constructor(source: string) {
		super(source);
	}
}

export class PunctuatorToken extends Token {
	constructor(source: string) {
		super(source);
	}
}

export class NumberToken extends Token {
	constructor(source: string) {
		super(source);
	}
}

export class StringToken extends Token {
	constructor(source: string) {
		super(source);
	}
}

export class EOFToken extends Token {
	constructor() {
		super("");
	}
}
