import { CodePointRange } from "./CodePointRange";

export const createRangeCheckUtil =
	(options: { min: number; max: number }) => (codePoint: number) =>
		CodePointRange.of(options).contains(codePoint);

export const isUpperCaseAToF = createRangeCheckUtil({
	min: "A".codePointAt(0)!,
	max: "F".codePointAt(0)!,
});

export const isLowerCaseAToF = createRangeCheckUtil({
	min: "a".codePointAt(0)!,
	max: "f".codePointAt(0)!,
});

export const isControlCharacter = createRangeCheckUtil({
	min: 0x0000,
	max: 0x001f,
});

export const isWhitespace = (codePoint: number) => {
	const whitespaceCodePoints = [" ", "\t", "\n", "\r"].map((c) =>
		c.codePointAt(0)
	);

	return whitespaceCodePoints.includes(codePoint);
};

export const assertValidCodePoint = (codePoint: number) => {
	if (codePoint < 0) {
		throw new Error(
			`code point must be non negative number, get ${codePoint}`
		);
	}
};
