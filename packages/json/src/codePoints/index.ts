export * from "./base";
export * from "./CodePointRange";
export * from "./surrogate";
export * from "./decimal";
export * from "./hexadecimal";

export interface CodePointPredicate {
	(cp: number): boolean;
}

export function isSameCodePoint(codePoint: number, str: string, index = 0) {
	const char = str.codePointAt(index);
	if (char === void 0) {
		throw new Error(`string ${str} has no code point at index ${index}`);
	}

	return codePoint === char;
}

export const CHAR_EOF = -1;

export function isEOFCharacter(codePoint: number) {
	return CHAR_EOF === codePoint;
}

/**
 * TODO: [...str] throw error in ts-node
 */
export function getStringCodePoints(str: string) {
	const codePoints: number[] = [];

	for (const c of str) {
		const codePoint = c.codePointAt(0);
		if (typeof codePoint === "number") {
			codePoints.push(codePoint);
		}
	}

	return codePoints;
}
