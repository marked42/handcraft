export enum TokenType {
    Symbol,
    Number,
    String,
    Punctuator,
    Unknown,
}

export interface TokenBase {
    type: TokenType;
    source: string;
}

export interface TokenSymbol extends TokenBase {
    type: TokenType.Symbol;
    name: string;
}

export interface TokenNumber extends TokenBase {
    type: TokenType.Number;
    value: number;
}

export interface TokenString {
    type: TokenType.String;
    value: string;
}

export interface TokenPunctuator extends TokenBase {
    type: TokenType.Punctuator;
}

export interface TokenUnknown extends TokenBase {
    type: TokenType.Unknown;
}

// FIXME: 增加Token类型需要修改这里，如何使用开闭原则？
export type Token =
    | TokenSymbol
    | TokenString
    | TokenNumber
    | TokenUnknown
    | TokenPunctuator;

export function tokenize(input: string): Token[] {
    const segments = input
        .replaceAll("(", " ( ")
        .replaceAll(")", " ) ")
        .trim()
        .split(/\s+/);

    return segments.map((source) => {
        if (/^[a-zA-Z+\-*/=?][a-zA-Z0-9+\-*/=?]*$/.test(source)) {
            return { type: TokenType.Symbol, source, name: source };
        }

        if (/^"[^"]*"$/.test(source)) {
            return {
                type: TokenType.String,
                source,
                value: source.slice(1, -1),
            };
        }

        const number = Number.parseFloat(source);
        if (!Number.isNaN(number)) {
            return { type: TokenType.Number, source, value: number };
        }

        if (["(", ")"].includes(source)) {
            return { type: TokenType.Punctuator, source };
        }

        return { type: TokenType.Unknown, source, value: source };
    });
}
