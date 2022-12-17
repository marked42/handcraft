"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodePointFromSurrogatePair = exports.isHighSurrogate = exports.isLowSurrogate = exports.HIGH_SURROGATE_MAX = exports.HIGH_SURROGATE_MIN = exports.LOW_SURROGATE_MAX = exports.LOW_SURROGATE_MIN = void 0;
var base_1 = require("./base");
exports.LOW_SURROGATE_MIN = 0xd800;
exports.LOW_SURROGATE_MAX = 0xdbff;
exports.HIGH_SURROGATE_MIN = 0xdc00;
exports.HIGH_SURROGATE_MAX = 0xdfff;
exports.isLowSurrogate = (0, base_1.createRangeCheckUtil)({
    min: exports.LOW_SURROGATE_MIN,
    max: exports.LOW_SURROGATE_MAX,
});
exports.isHighSurrogate = (0, base_1.createRangeCheckUtil)({
    min: exports.HIGH_SURROGATE_MIN,
    max: exports.HIGH_SURROGATE_MAX,
});
function getCodePointFromSurrogatePair(low, high) {
    if (!(0, exports.isLowSurrogate)(low)) {
        throw new Error("".concat(low, "\u4E0D\u662F\u4F4E\u4EE3\u7406\u5BF9 U+D800 ~ U+DBFF"));
    }
    if (!(0, exports.isHighSurrogate)(high)) {
        throw new Error("".concat(high, "\u4E0D\u662F\u9AD8\u4EE3\u7406\u5BF9 U+DC00 ~ U+DFFF"));
    }
    return (low - exports.LOW_SURROGATE_MIN) * (high - exports.HIGH_SURROGATE_MAX);
}
exports.getCodePointFromSurrogatePair = getCodePointFromSurrogatePair;
//# sourceMappingURL=surrogate.js.map