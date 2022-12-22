import * as readline from "readline";
import { Context } from "./context";
import { interpret } from "./interpreter";
import { getStandardLibrary } from "./library";

import { stdin as input, stdout as output } from "process";
import { format } from "./utils";

const rl = readline.createInterface({ input, output });

export function repl(prompt = "lisp > ") {
    const rootContext = new Context(getStandardLibrary());
    rl.setPrompt(prompt);
    rl.prompt();
    rl.on("line", (line: string) => {
        try {
            const value = interpret(line, rootContext);
            console.log(format(value));
        } catch (e) {
            console.error((e as any)?.message ?? e);
        }
        rl.prompt();
    });
}
