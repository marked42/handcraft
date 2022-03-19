import { assertValidCodePoint } from "./base";

export class CodePointRange {
	private constructor(
		public readonly min: number,
		public readonly max: number
	) {}

	contains(codePoint: number) {
		return this.min <= codePoint && codePoint <= this.max;
	}

	static of({ min, max }: { min: number; max: number }) {
		assertValidCodePoint(min);
		assertValidCodePoint(max);
		if (min > max) {
			throw new Error(
				`Code point range min (${min}) must be smaller than max (${max}) !`
			);
		}

		return new CodePointRange(min, max);
	}
}
