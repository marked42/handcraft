import { createRangeCheckUtil } from "./base";

export const isDecimalDigit = createRangeCheckUtil({
	min: "0".codePointAt(0)!,
	max: "9".codePointAt(0)!,
});

export const isDecimalDigitOneToNine = createRangeCheckUtil({
	min: "1".codePointAt(0)!,
	max: "9".codePointAt(0)!,
});

export function getDecimalDigitMathematicalValue(codePoint: number) {
	if (isDecimalDigit(codePoint)) {
		return codePoint - "0".codePointAt(0)!;
	}

	throw new Error(
		`code point ${String.fromCodePoint(
			codePoint
		)}(${codePoint}) is not decimal digit`
	);
}
