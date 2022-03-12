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
