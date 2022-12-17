"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpret = void 0;
var Eva_1 = require("./Eva");
var parser_1 = require("./parser");
function interpret(source, moduleFolder) {
    var eva = new Eva_1.Eva();
    if (moduleFolder) {
        eva.setModuleFolder(moduleFolder);
    }
    var wrapInBlock = "(begin ".concat(source, ")");
    var expr = parser_1.EvaParser.parse(wrapInBlock);
    return eva.eval(expr);
}
exports.interpret = interpret;
//# sourceMappingURL=index.js.map