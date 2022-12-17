"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidCodePoint = exports.isWhitespace = exports.isControlCharacter = exports.isLowerCaseAToF = exports.isUpperCaseAToF = exports.createRangeCheckUtil = void 0;
var charcodes = require("charcodes");
var CodePointRange_1 = require("./CodePointRange");
var createRangeCheckUtil = function (options) { return function (codePoint) {
    return CodePointRange_1.CodePointRange.of(options).contains(codePoint);
}; };
exports.createRangeCheckUtil = createRangeCheckUtil;
exports.isUpperCaseAToF = (0, exports.createRangeCheckUtil)({
    min: charcodes.uppercaseA,
    max: charcodes.uppercaseF,
});
exports.isLowerCaseAToF = (0, exports.createRangeCheckUtil)({
    min: charcodes.lowercaseA,
    max: charcodes.lowercaseF,
});
exports.isControlCharacter = (0, exports.createRangeCheckUtil)({
    min: 0x0000,
    max: 0x001f,
});
var isWhitespace = function (codePoint) {
    var whitespaceCodePoints = [" ", "\t", "\n", "\r"].map(function (c) {
        return c.codePointAt(0);
    });
    return whitespaceCodePoints.includes(codePoint);
};
exports.isWhitespace = isWhitespace;
var assertValidCodePoint = function (codePoint) {
    if (codePoint < 0) {
        throw new Error("code point must be non negative number, get ".concat(codePoint));
    }
};
exports.assertValidCodePoint = assertValidCodePoint;
//# sourceMappingURL=base.js.map