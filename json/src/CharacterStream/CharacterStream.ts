export interface CharacterStream {
	peek(offset?: number): number;

	advance(offset: number): void;

	eat(text: string): void;

	get codePointIndex(): number;

	skipWhitespaceCharacters(): void;
}
