import * as readline from "readline";

function outputPrompt() {
    process.stdout.write("> ");
}

export function startRepl(options: {
    listener: (line: string) => void;
    banner?: string;
}) {
    const { listener, banner = "Welcome, have fun with eva lang!" } = options;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    rl.on("line", function (line: string) {
        try {
            listener(line);
        } catch (e) {
            console.log(e);
        }
        outputPrompt();
    });

    console.log(banner);
    outputPrompt();
}
