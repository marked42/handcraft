"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringCharacterStream = void 0;
var AbstractCharacterStream_1 = require("./AbstractCharacterStream");
var codePoints_1 = require("../codePoints");
var StringCharacterStream = /** @class */ (function (_super) {
    __extends(StringCharacterStream, _super);
    function StringCharacterStream(text) {
        var _this = _super.call(this) || this;
        _this.text = text;
        _this.codePointIndex = 0;
        _this.codePoints = [];
        _this.codePoints = (0, codePoints_1.getStringCodePoints)(text);
        return _this;
    }
    StringCharacterStream.prototype.peek = function (offset) {
        if (offset === void 0) { offset = 0; }
        var index = this.codePointIndex + offset;
        return index < this.codePoints.length
            ? this.codePoints[index]
            : codePoints_1.CHAR_EOF;
    };
    StringCharacterStream.prototype.advance = function (count) {
        this.codePointIndex = Math.min(this.codePointIndex + count, this.codePoints.length);
    };
    StringCharacterStream.prototype.eat = function (text) {
        if (typeof text !== "string" || !text.length) {
            throw new Error("expect non empty string, get ".concat(text));
        }
        for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
            var c = text_1[_i];
            if (this.peek() !== c.charCodeAt(0)) {
                throw new Error("unexpected keyword at index ".concat(this.codePointIndex, " from input ").concat(this.text));
            }
            this.advance(1);
        }
    };
    return StringCharacterStream;
}(AbstractCharacterStream_1.AbstractCharacterStream));
exports.StringCharacterStream = StringCharacterStream;
//# sourceMappingURL=StringCharacterStream.js.map