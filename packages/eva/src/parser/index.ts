import { Expression } from "../expression";

interface EvaParser {
	parse(input: string): Expression;
}

/* eslint-disable-next-line */
const EvaParser: EvaParser = require("./generated");

export { EvaParser };
