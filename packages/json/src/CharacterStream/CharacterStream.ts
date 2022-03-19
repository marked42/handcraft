import { CodePointPredicate } from "../codePoints";

export interface CharacterStream {
	get codePointIndex(): number;

	peek(offset?: number): number;

	// TODO: maybe better to align with TokenStream naming convention
	advance(offset: number): void;

	eat(text: string): void;

	match(predicate: CodePointPredicate, offset?: number): boolean;
	match(text: string): boolean;

	expect(text: string, message: string): void;

	skipWhitespaceCharacters(): void;
}
