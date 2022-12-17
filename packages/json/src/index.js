"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printJSON = exports.parseJSON = void 0;
var CharacterStream_1 = require("./CharacterStream");
var JSONParser_1 = require("./JSONParser");
var JSONPrinter_1 = require("./JSONPrinter");
var TokenStream_1 = require("./TokenStream");
function parseJSON(text) {
    var characterStream = new CharacterStream_1.StringCharacterStream(text);
    var tokenStream = new TokenStream_1.TokenStream(characterStream);
    var parser = new JSONParser_1.JSONParser(tokenStream);
    return parser.parse();
}
exports.parseJSON = parseJSON;
function printJSON(value) {
    var printer = new JSONPrinter_1.JSONPrinter();
    return printer.print(value);
}
exports.printJSON = printJSON;
//# sourceMappingURL=index.js.map