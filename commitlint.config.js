module.exports = {
	extends: [
		"@commitlint/config-conventional",
		// lerna monorepo增加每个包名作为合法的scope
		"@commitlint/config-lerna-scopes",
	],
};
