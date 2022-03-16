import { CharacterStream } from "./CharacterStream";
import { isWhitespace } from "../codePoints";

export abstract class AbstractCharacterStream implements CharacterStream {
	abstract get codePointIndex(): number;

	abstract peek(offset?: number): number;

	abstract advance(offset: number): void;

	abstract eat(text: string): void;

	public skipWhitespaceCharacters(): void {
		while (isWhitespace(this.peek())) {
			this.advance(1);
		}
	}
}
