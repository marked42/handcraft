import * as charcodes from "charcodes";
import { CodePointRange } from "./CodePointRange";

export const createRangeCheckUtil =
	(options: { min: number; max: number }) => (codePoint: number) =>
		CodePointRange.of(options).contains(codePoint);

export const isUpperCaseAToF = createRangeCheckUtil({
	min: charcodes.uppercaseA,
	max: charcodes.uppercaseF,
});

export const isLowerCaseAToF = createRangeCheckUtil({
	min: charcodes.lowercaseA,
	max: charcodes.lowercaseF,
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
