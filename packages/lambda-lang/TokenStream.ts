import { isNewLine } from "./char";
import { InputStream } from "./InputStream";
import {
    Token,
    TokenKeyword,
    TokenNum,
    TokenOperator,
    TokenPunctuation,
    TokenStr,
    TokenVar,
} from "./Token";

const KEY_WORDS = ["if", "then", "else", "lambda", "λ", "true", "false"];

export interface Predicate {
    (char: string): boolean;
}

export class TokenStream {
    constructor(private readonly inputStream: InputStream) {}

    readWhile(predicate: Predicate) {
        let str = "";
        while (!this.inputStream.eof() && predicate(this.inputStream.peek())) {
            str += this.inputStream.next();
        }

        return str;
    }

    readNumber(): TokenNum {
        let hasDot = false;
        const number = this.readWhile((ch) => {
            if (ch === ".") {
                if (hasDot) {
                    return false;
                }
                hasDot = true;
                return true;
            }
            return isDigit(ch);
        });

        return { type: "num", value: parseFloat(number) };
    }

    readIdentifier(): TokenVar | TokenKeyword {
        const id = this.readWhile(isId);

        return {
            type: isKeyword(id) ? "kw" : "var",
            value: id,
        };
    }

    readString(): TokenStr {
        return { type: "str", value: this.readEscaped('"') };
    }

    /**
     * 解析碰到end之前的部分，中间支持转义序列
     */
    readEscaped(end: string) {
        let escaped = false;
        let str = "";

        // 跳过开头的引号
        this.inputStream.next();

        while (!this.inputStream.eof()) {
            const char = this.inputStream.next();
            if (escaped) {
                str += char;
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === end) {
                break;
            } else {
                str += char;
            }
        }

        return str;
    }

    skipComment() {
        this.readWhile((char) => !isNewLine(char));
        const skipNewLineChar = () => {
            this.inputStream.next();
        };

        skipNewLineChar();
    }

    readNext(): Token | null {
        this.readWhile(isWhitespace);

        if (this.inputStream.eof()) {
            return null;
        }

        const char = this.inputStream.peek();
        if (char === "#") {
            this.skipComment();
            return this.readNext();
        }

        if (char === '"') {
            return this.readString();
        }

        if (isDigit(char)) {
            return this.readNumber();
        }

        if (isIdStart(char)) {
            return this.readIdentifier();
        }

        if (isPunctuation(char)) {
            return {
                type: "punc",
                value: this.inputStream.next(),
            } as TokenPunctuation;
        }

        if (isOperatorChar(char)) {
            // const op: TokenOperator = {
            //     type: "op",
            //     value: this.readWhile(isOperatorChar),
            // };

            // return op;
            return {
                type: "op",
                value: this.readWhile(isOperatorChar),
            } as TokenOperator;
        }

        this.inputStream.croak("Can't handle character " + char);
    }
}

function isKeyword(id: string) {
    return KEY_WORDS.includes(id);
}

function isDigit(char: string) {
    return /[0-9]/i.test(char);
}

function isIdStart(char: string) {
    return /[a-z_λ]/i.test(char);
}

function isId(char: string) {
    return isIdStart(char) || "?!-<>=0123456789".includes(char);
}

function isOperatorChar(char: string) {
    return "+-*/%=&|<>!".indexOf(char) >= 0;
}

function isPunctuation(char: string) {
    return ",;(){}[]".indexOf(char) >= 0;
}

function isWhitespace(char: string) {
    return " \t\n".indexOf(char) >= 0;
}
