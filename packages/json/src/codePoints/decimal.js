"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecimalDigitMathematicalValue = exports.isDecimalDigitOneToNine = exports.isDecimalDigit = void 0;
var charcodes = require("charcodes");
var base_1 = require("./base");
exports.isDecimalDigit = (0, base_1.createRangeCheckUtil)({
    min: charcodes.digit0,
    max: charcodes.digit9,
});
exports.isDecimalDigitOneToNine = (0, base_1.createRangeCheckUtil)({
    min: charcodes.digit1,
    max: charcodes.digit9,
});
function getDecimalDigitMathematicalValue(codePoint) {
    if ((0, exports.isDecimalDigit)(codePoint)) {
        return codePoint - charcodes.digit0;
    }
    throw new Error("code point ".concat(String.fromCodePoint(codePoint), "(").concat(codePoint, ") is not decimal digit"));
}
exports.getDecimalDigitMathematicalValue = getDecimalDigitMathematicalValue;
//# sourceMappingURL=decimal.js.map