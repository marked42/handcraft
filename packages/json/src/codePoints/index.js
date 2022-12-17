"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStringCodePoints = exports.isEOFCharacter = exports.CHAR_EOF = exports.isSameCodePoint = void 0;
__exportStar(require("./base"), exports);
__exportStar(require("./CodePointRange"), exports);
__exportStar(require("./surrogate"), exports);
__exportStar(require("./decimal"), exports);
__exportStar(require("./hexadecimal"), exports);
function isSameCodePoint(codePoint, str, index) {
    if (index === void 0) { index = 0; }
    var char = str.codePointAt(index);
    if (char === void 0) {
        throw new Error("string ".concat(str, " has no code point at index ").concat(index));
    }
    return codePoint === char;
}
exports.isSameCodePoint = isSameCodePoint;
exports.CHAR_EOF = -1;
function isEOFCharacter(codePoint) {
    return exports.CHAR_EOF === codePoint;
}
exports.isEOFCharacter = isEOFCharacter;
/**
 * TODO: [...str] throw error in ts-node
 */
function getStringCodePoints(str) {
    var codePoints = [];
    for (var _i = 0, str_1 = str; _i < str_1.length; _i++) {
        var c = str_1[_i];
        var codePoint = c.codePointAt(0);
        if (typeof codePoint === "number") {
            codePoints.push(codePoint);
        }
    }
    return codePoints;
}
exports.getStringCodePoints = getStringCodePoints;
//# sourceMappingURL=index.js.map