"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Null"] = 0] = "Null";
    TokenType[TokenType["Boolean"] = 1] = "Boolean";
    TokenType[TokenType["Number"] = 2] = "Number";
    TokenType[TokenType["String"] = 3] = "String";
    TokenType[TokenType["LeftParenthesis"] = 4] = "LeftParenthesis";
    TokenType[TokenType["RightParenthesis"] = 5] = "RightParenthesis";
    TokenType[TokenType["LeftSquareBracket"] = 6] = "LeftSquareBracket";
    TokenType[TokenType["RightSquareBracket"] = 7] = "RightSquareBracket";
    TokenType[TokenType["Comma"] = 8] = "Comma";
    TokenType[TokenType["Colon"] = 9] = "Colon";
    TokenType[TokenType["EOF"] = 10] = "EOF";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
//# sourceMappingURL=Token.js.map