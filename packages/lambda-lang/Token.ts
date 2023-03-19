export interface TokenPunctuation {
    type: "punc";
    value: string;
}

export interface TokenNum {
    type: "num";
    value: number;
}

export interface TokenStr {
    type: "str";
    value: string;
}

export interface TokenKeyword {
    type: "kw";
    value: string;
}

export interface TokenVar {
    type: "var";
    value: string;
}

export interface TokenOperator {
    type: "op";
    value: string;
}

export type Token =
    | TokenPunctuation
    | TokenNum
    | TokenStr
    | TokenKeyword
    | TokenVar
    | TokenOperator;
