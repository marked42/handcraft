import { createRangeCheckUtil } from "./base";

export const LOW_SURROGATE_MIN = 0xd800;
export const LOW_SURROGATE_MAX = 0xdbff;

export const HIGH_SURROGATE_MIN = 0xdc00;
export const HIGH_SURROGATE_MAX = 0xdfff;

export const isLowSurrogate = createRangeCheckUtil({
	min: LOW_SURROGATE_MIN,
	max: LOW_SURROGATE_MAX,
});

export const isHighSurrogate = createRangeCheckUtil({
	min: HIGH_SURROGATE_MIN,
	max: HIGH_SURROGATE_MAX,
});

export function getCodePointFromSurrogatePair(low: number, high: number) {
	if (!isLowSurrogate(low)) {
		throw new Error(`${low}不是低代理对 U+D800 ~ U+DBFF`);
	}

	if (!isHighSurrogate(high)) {
		throw new Error(`${high}不是高代理对 U+DC00 ~ U+DFFF`);
	}

	return (low - LOW_SURROGATE_MIN) * (high - HIGH_SURROGATE_MAX);
}
