export function isWhitespace(codePoint: number) {
	const whitespaceCodePoints = [" ", "\t", "\n", "\r"].map((c) =>
		c.codePointAt(0)
	);

	return whitespaceCodePoints.includes(codePoint);
}

export function isControlCharacter(codePoint: number) {
	const min = 0x0000;
	const max = 0x001f;

	return min <= codePoint && codePoint <= max;
}

export function isSameCodePoint(
	codePoint: number,
	str: string,
	index: number = 0
) {
	const char = str.codePointAt(index);
	if (char === void 0) {
		throw new Error(`string ${str} has no code point at index ${index}`);
	}

	return codePoint === char;
}

export function isDecimalDigit(codePoint: number) {
	const min = "0".codePointAt(0)!;
	const max = "9".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

export function isDecimalDigitOneToNine(codePoint: number) {
	const min = "1".codePointAt(0)!;
	const max = "9".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

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

export function containsCodePoint(
	codePointRange: [number, number],
	codePoint: number
) {
	const [min, max] = codePointRange;

	return min <= codePoint && codePoint <= max;
}

export function isLowerCaseAToF(codePoint: number) {
	const min = "a".codePointAt(0)!;
	const max = "f".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

export function isUpperCaseAToF(codePoint: number) {
	const min = "A".codePointAt(0)!;
	const max = "F".codePointAt(0)!;

	return containsCodePoint([min, max], codePoint);
}

export function isHexDigit(codePoint: number) {
	return (
		isDecimalDigit(codePoint) ||
		isLowerCaseAToF(codePoint) ||
		isUpperCaseAToF(codePoint)
	);
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

const LowSurrogateRange = { min: 0xd800, max: 0xdbff };
const HighSurrogateRange = { min: 0xdc00, max: 0xdfff };

class CodePointRange {
	constructor(public readonly min: number, public readonly max: number) {}

	contains(codePoint: number) {
		return this.min <= codePoint && codePoint <= this.max;
	}
}

function isLowSurrogate(codePoint: number) {
	const { min, max } = LowSurrogateRange;

	return min <= codePoint && codePoint <= max;
}

function isHighSurrogate(codePoint: number) {
	const { min, max } = HighSurrogateRange;

	return min <= codePoint && codePoint <= max;
}

function getCodePointFromSurrogatePair(low: number, high: number) {
	if (!isLowSurrogate(low)) {
		throw new Error(`${low}不是低代理对 U+D800 ~ U+DBFF`);
	}

	if (!isHighSurrogate(high)) {
		throw new Error(`${high}不是高代理对 U+DC00 ~ U+DFFF`);
	}

	return (low - LowSurrogateRange.min) * (high - HighSurrogateRange.min);
}
