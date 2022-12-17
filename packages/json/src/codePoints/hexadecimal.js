"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHexDigitsMathematicalValue = exports.getHexDigitMathematicalValue = exports.isHexDigit = void 0;
var charcodes = require("charcodes");
var base_1 = require("./base");
var decimal_1 = require("./decimal");
function isHexDigit(codePoint) {
    return ((0, decimal_1.isDecimalDigit)(codePoint) ||
        (0, base_1.isLowerCaseAToF)(codePoint) ||
        (0, base_1.isUpperCaseAToF)(codePoint));
}
exports.isHexDigit = isHexDigit;
function getHexDigitMathematicalValue(codePoint) {
    if ((0, decimal_1.isDecimalDigit)(codePoint)) {
        return (0, decimal_1.getDecimalDigitMathematicalValue)(codePoint);
    }
    var DECIMAL_RADIX = 10;
    if ((0, base_1.isLowerCaseAToF)(codePoint)) {
        return codePoint - charcodes.lowercaseA + DECIMAL_RADIX;
    }
    if ((0, base_1.isUpperCaseAToF)(codePoint)) {
        return codePoint - charcodes.uppercaseA + DECIMAL_RADIX;
    }
    throw new Error("code point ".concat(String.fromCodePoint(codePoint), "(").concat(codePoint, ") is not hex digit"));
}
exports.getHexDigitMathematicalValue = getHexDigitMathematicalValue;
function getHexDigitsMathematicalValue() {
    var codePoints = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        codePoints[_i] = arguments[_i];
    }
    var unit = 0x0001;
    var value = 0;
    for (var i = codePoints.length - 1; i >= 0; i--) {
        value += getHexDigitMathematicalValue(codePoints[i]) * unit;
        unit *= 16;
    }
    return value;
}
exports.getHexDigitsMathematicalValue = getHexDigitsMathematicalValue;
//# sourceMappingURL=hexadecimal.js.map