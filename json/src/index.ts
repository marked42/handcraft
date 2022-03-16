import { StringCharacterStream } from "./CharacterStream";
import { JSONParser } from "./JSONParser";
import { TokenStream } from "./TokenStream";

export function parseJSON(text: string) {
	const characterStream = new StringCharacterStream(text);
	const tokenStream = new TokenStream(characterStream);
	const parser = new JSONParser(tokenStream);

	return parser.parse();
}
