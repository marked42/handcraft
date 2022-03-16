import { AbstractCharacterStream } from "./AbstractCharacterStream";
import { CHAR_EOF, getStringCodePoints } from "../codePoints";

export class StringCharacterStream extends AbstractCharacterStream {
	public codePointIndex = 0;
	public readonly codePoints: number[] = [];

	constructor(private readonly text: string) {
		super();

		this.codePoints = getStringCodePoints(text);
	}

	peek(offset = 0) {
		const index = this.codePointIndex + offset;

		return index < this.codePoints.length
			? this.codePoints[index]
			: CHAR_EOF;
	}

	advance(count: number) {
		this.codePointIndex = Math.min(
			this.codePointIndex + count,
			this.codePoints.length
		);
	}

	eat(text: string) {
		if (typeof text !== "string" || !text.length) {
			throw new Error(`expect non empty string, get ${text}`);
		}

		for (const c of text) {
			if (this.peek() !== c.charCodeAt(0)) {
				throw new Error(
					`unexpected keyword at index ${this.codePointIndex} from input ${this.text}`
				);
			}
			this.advance(1);
		}
	}
}
