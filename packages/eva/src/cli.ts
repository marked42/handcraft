#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { interpret } from "./index";

function main(argv: string[]) {
	const [, , mode, exp] = argv;

	if (mode === "-e") {
		return interpret(exp);
	}

	if (mode === "-f") {
		const file: string = fs.readFileSync(exp, "utf8");
		return interpret(file, path.dirname(path.resolve(exp)) as string);
	}

	// TODO: REPL
}

main(process.argv);
