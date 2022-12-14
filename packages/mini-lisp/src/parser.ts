import { type Token, tokenize } from "./tokenizer";

export type Atom = Token;
export type List = Array<List | Atom>;

export function parse(input: string): List {
    const tokens = tokenize(input);

    return parseImpl(tokens);
}

function parseImpl(tokens: Token[], list: List = []): List {
    const nextToken = tokens.shift();
    if (!nextToken) {
        return list;
    }

    if (nextToken.type === "punctuator" && nextToken.value === "(") {
        list.push(parseImpl(tokens));
        return parseImpl(tokens, list);
    } else if (nextToken.type === "punctuator" && nextToken.value === ")") {
        return list;
    }

    list.push(nextToken);
    return parseImpl(tokens, list);
}
