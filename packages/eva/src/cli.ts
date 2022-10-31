#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";

import { interpret } from "./index";
import { EvaParser } from "./parser";
import { Eva } from "./Eva";
import { startRepl } from "./repl";

function main(argv: string[]) {
	const [, , mode, exp] = argv;

	if (mode === "-e") {
		interpret(exp);
		return;
	}

	if (mode === "-f") {
		const file: string = fs.readFileSync(exp, "utf8");
		interpret(file, path.dirname(path.resolve(exp)));
		return;
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
