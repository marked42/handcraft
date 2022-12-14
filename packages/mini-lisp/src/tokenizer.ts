export interface TokenIdentifier {
    type: "id";
    value: string;
}

export interface TokenNumber {
    type: "number";
    value: number;
}

export interface TokenPunctuator {
    type: "punctuator";
    value: string;
}

export interface TokenUnknown {
    type: "unknown";
    value: string;
}

export interface TokenString {
    type: "string";
    value: string;
}

export interface TokenOther {
    type: "other";
    value: string;
}

// FIXME: 增加Token类型需要修改这里，如何使用开闭原则？
export type Token =
    | TokenIdentifier
    | TokenString
    | TokenNumber
    | TokenUnknown
    | TokenOther
    | TokenPunctuator;

export function tokenize(input: string): Token[] {
    const segments = input
        .replaceAll("(", " ( ")
        .replaceAll(")", " ) ")
        .trim()
        .split(/\s+/);

    return segments.map((text) => {
        if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(text)) {
            return { type: "id", value: text };
        }

        if (/^"[^"]*"$/.test(text)) {
            return { type: "string", value: text.slice(1, -1) };
        }

        const number = Number.parseFloat(text);
        if (!Number.isNaN(number)) {
            return { type: "number", value: number };
        }

        if (["(", ")"].includes(text)) {
            return { type: "punctuator", value: text };
        }

        return { type: "unknown", value: text };
    });
}
