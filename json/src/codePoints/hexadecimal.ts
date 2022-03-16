import { isLowerCaseAToF, isUpperCaseAToF } from "./base";
import { getDecimalDigitMathematicalValue, isDecimalDigit } from "./decimal";

export function isHexDigit(codePoint: number) {
	return (
		isDecimalDigit(codePoint) ||
		isLowerCaseAToF(codePoint) ||
		isUpperCaseAToF(codePoint)
	);
}

export function getHexDigitMathematicalValue(codePoint: number) {
	if (isDecimalDigit(codePoint)) {
		return getDecimalDigitMathematicalValue(codePoint);
	}

	if (isLowerCaseAToF(codePoint)) {
		return codePoint - "a".codePointAt(0)! + 10;
	}

	if (isUpperCaseAToF(codePoint)) {
		return codePoint - "A".codePointAt(0)! + 10;
	}

	throw new Error(
		`code point ${String.fromCodePoint(
			codePoint
		)}(${codePoint}) is not hex digit`
	);
}

export function getHexDigitsMathematicalValue(...codePoints: number[]) {
	let unit = 0x0001;
	let value = 0;
	for (let i = codePoints.length - 1; i >= 0; i--) {
		value += getHexDigitMathematicalValue(codePoints[i]) * unit;
		unit *= 16;
	}

	return value;
}
