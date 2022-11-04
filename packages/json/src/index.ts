import { StringCharacterStream } from "./CharacterStream";
import { JSONValue } from "./JSONValue";
import { JSONParser } from "./JSONParser";
import { JSONPrinter } from "./JSONPrinter";
import { TokenStream } from "./TokenStream";

export function parseJSON(text: string) {
    const characterStream = new StringCharacterStream(text);
    const tokenStream = new TokenStream(characterStream);
    const parser = new JSONParser(tokenStream);

    return parser.parse();
}

export function printJSON(value: JSONValue) {
    const printer = new JSONPrinter();

    return printer.print(value);
}

describe("test", () => {
    // fuck
});
