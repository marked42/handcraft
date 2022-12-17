"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRepl = void 0;
var readline = require("readline");
function outputPrompt() {
    process.stdout.write("> ");
}
function startRepl(options) {
    var listener = options.listener, _a = options.banner, banner = _a === void 0 ? "Welcome, have fun with eva lang!" : _a;
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    rl.on("line", function (line) {
        try {
            listener(line);
        }
        catch (e) {
            console.log(e);
        }
        outputPrompt();
    });
    console.log(banner);
    outputPrompt();
}
exports.startRepl = startRepl;
//# sourceMappingURL=repl.js.map