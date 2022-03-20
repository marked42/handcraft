import * as charcodes from "charcodes";
import { createRangeCheckUtil } from "./base";

export const isDecimalDigit = createRangeCheckUtil({
	min: charcodes.digit0,
	max: charcodes.digit9,
});

export const isDecimalDigitOneToNine = createRangeCheckUtil({
	min: charcodes.digit1,
	max: charcodes.digit9,
});

export function getDecimalDigitMathematicalValue(codePoint: number) {
	if (isDecimalDigit(codePoint)) {
		return codePoint - charcodes.digit0;
	}

	throw new Error(
		`code point ${String.fromCodePoint(
			codePoint
		)}(${codePoint}) is not decimal digit`
	);
}
