"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractCharacterStream = void 0;
var codePoints_1 = require("../codePoints");
var AbstractCharacterStream = /** @class */ (function () {
    function AbstractCharacterStream() {
    }
    AbstractCharacterStream.prototype.skipWhitespaceCharacters = function () {
        while ((0, codePoints_1.isWhitespace)(this.peek())) {
            this.advance(1);
        }
    };
    AbstractCharacterStream.prototype.match = function (condition, offset) {
        var _this = this;
        if (typeof condition === "function") {
            return condition(this.peek(offset));
        }
        var codePoints = (0, codePoints_1.getStringCodePoints)(condition);
        return codePoints.every(function (cp, i) { return _this.peek(i) === cp; });
    };
    AbstractCharacterStream.prototype.expect = function (text, message) {
        var matched = this.match(text);
        if (!matched) {
            throw new Error(message);
        }
    };
    return AbstractCharacterStream;
}());
exports.AbstractCharacterStream = AbstractCharacterStream;
//# sourceMappingURL=AbstractCharacterStream.js.map