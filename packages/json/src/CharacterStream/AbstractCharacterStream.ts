import { CharacterStream } from "./CharacterStream";
import {
	getStringCodePoints,
	isWhitespace,
	CodePointPredicate,
} from "../codePoints";

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

	public match(predicate: CodePointPredicate, offset?: number): boolean;
	public match(text: string): boolean;
	public match(condition: string | CodePointPredicate, offset?: number) {
		if (typeof condition === "function") {
			return condition(this.peek(offset));
		}

		const codePoints = getStringCodePoints(condition);

		return codePoints.every((cp, i) => this.peek(i) === cp);
	}

	public expect(text: string, message: string) {
		const matched = this.match(text);

		if (!matched) {
			throw new Error(message);
		}
	}
}
