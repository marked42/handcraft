export function parseJSON(text: string) {
	if (text === "null") {
		return null;
	}

	if (text === "true") {
		return true;
	}

	if (text === "false") {
		return false;
	}

	return {};
}
