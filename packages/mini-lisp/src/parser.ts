import { type Token, tokenize, TokenType, TokenEOF } from "./tokenizer";
import {
    Expression,
    AtomExpression,
    ListExpression,
    ExpressionType,
} from "./expression";

export function parse(input: string): Expression[] {
    const tokens = new TokenStream(tokenize(input));

    return parseExpressions(tokens);
}

/**
 * Expressions: Expression+
 *
 * Expression: AtomExpression | ListExpression
 *
 * ListExpression: '(' Expression* ')'
 */
function parseExpressions(tokens: TokenStream): Expression[] {
    const expressions: Expression[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const token = tokens.peek();
        if (token.type === TokenType.EOF) {
            // requires one expression at least
            if (expressions.length === 0) {
                throw new Error("unexpected end");
            } else {
                break;
            }
        }
        const expr = parseExpression(tokens);
        if (expr) {
            expressions.push(expr);
        } else {
            throw new Error(`unexpected token ${formatToken(token)}`);
        }
    }

    return expressions;
}

function parseExpression(tokens: TokenStream) {
    const atom = parseAtomExpression(tokens);
    if (atom) {
        return atom;
    }

    const list = parseListExpression(tokens);
    if (list) {
        return list;
    }

    return undefined;
}

function parseAtomExpression(tokens: TokenStream): AtomExpression | undefined {
    if (tokens.peek().type === TokenType.EOF) {
        return;
    }

    tokens.store();

    const token = tokens.next();
    switch (token.type) {
        case TokenType.Number:
            return { type: ExpressionType.Number, value: token.value };
        case TokenType.String:
            return { type: ExpressionType.String, value: token.value };
        case TokenType.Symbol:
            return { type: ExpressionType.Symbol, name: token.name };
        case TokenType.Boolean:
            return { type: ExpressionType.Boolean, value: token.value };
        default:
            tokens.restore();
            return;
    }
}

export class TokenStream {
    private index = 0;
    private backupIndex: number[] = [];

    constructor(private tokens: Token[]) {}

    store() {
        this.backupIndex.push(this.index);
    }

    restore() {
        const index = this.backupIndex.pop();
        if (typeof index !== "number") {
            throw new Error("no backup index");
        }
        this.index = index;
    }

    next() {
        return this.index < this.tokens.length
            ? this.tokens[this.index++]
            : TokenEOF;
    }

    peek() {
        return this.index < this.tokens.length
            ? this.tokens[this.index]
            : TokenEOF;
    }
}

function formatToken(token: Token) {
    return JSON.stringify(token, null, 2);
}

function parseListExpression(tokens: TokenStream): ListExpression | undefined {
    tokens.store();

    const list: ListExpression = {
        type: ExpressionType.List,
        items: [],
    };

    const first = tokens.next();
    if (
        first.type === TokenType.EOF ||
        first.type !== TokenType.Punctuator ||
        first.source !== "("
    ) {
        tokens.restore();
        return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const next = tokens.peek();
        if (next.type === TokenType.EOF) {
            throw new Error(
                "unexpected end when parsing list expression, expect a right parenthesis to end list expression or other atom expression."
            );
        }

        if (next.type === TokenType.Punctuator && next.source === ")") {
            tokens.next();
            break;
        } else {
            const expr = parseExpression(tokens);
            if (expr) {
                list.items.push(expr);
            } else {
                throw new Error(
                    `unexpected token ${formatToken(tokens.peek())}`
                );
            }
        }
    }

    return list;
}
