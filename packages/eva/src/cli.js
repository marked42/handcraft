#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var index_1 = require("./index");
var parser_1 = require("./parser");
var Eva_1 = require("./Eva");
var repl_1 = require("./repl");
function main(argv) {
    var mode = argv[2], exp = argv[3];
    if (mode === "-e") {
        (0, index_1.interpret)(exp);
        return;
    }
    if (mode === "-f") {
        var file = fs.readFileSync(exp, "utf8");
        (0, index_1.interpret)(file, path.dirname(path.resolve(exp)));
        return;
    }
    // REPL
    var eva = new Eva_1.Eva();
    (0, repl_1.startRepl)({
        listener: function (line) {
            var expr = parser_1.EvaParser.parse(line);
            console.log(eva.eval(expr));
        },
    });
}
main(process.argv);
//# sourceMappingURL=cli.js.map