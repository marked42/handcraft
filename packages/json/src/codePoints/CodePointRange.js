"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodePointRange = void 0;
var base_1 = require("./base");
var CodePointRange = /** @class */ (function () {
    function CodePointRange(min, max) {
        this.min = min;
        this.max = max;
    }
    CodePointRange.prototype.contains = function (codePoint) {
        return this.min <= codePoint && codePoint <= this.max;
    };
    CodePointRange.of = function (_a) {
        var min = _a.min, max = _a.max;
        (0, base_1.assertValidCodePoint)(min);
        (0, base_1.assertValidCodePoint)(max);
        if (min > max) {
            throw new Error("Code point range min (".concat(min, ") must be smaller than max (").concat(max, ") !"));
        }
        return new CodePointRange(min, max);
    };
    return CodePointRange;
}());
exports.CodePointRange = CodePointRange;
//# sourceMappingURL=CodePointRange.js.map