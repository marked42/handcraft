import { JSONParser } from "./JSONParser";

export function parseJSON(text: string) {
	const parser = new JSONParser(text);

	return parser.parse();
}
