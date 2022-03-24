#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { interpret } from "./index";
import { EvaParser } from "./parser";
import { Eva } from "./Eva";
import { startRepl } from "./repl";

function main(argv: string[]) {
	const [, , mode, exp] = argv;

	if (mode === "-e") {
		return interpret(exp);
	}

	if (mode === "-f") {
		const file: string = fs.readFileSync(exp, "utf8");
		return interpret(file, path.dirname(path.resolve(exp)));
	}

	// REPL
	const eva = new Eva();
	startRepl({
		listener: (line) => {
			const expr = EvaParser.parse(line);

			console.log(eva.eval(expr));
		},
	});
}

main(process.argv);
