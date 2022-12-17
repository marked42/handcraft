"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONPrinter = void 0;
var JSONPrinter = /** @class */ (function () {
    function JSONPrinter() {
    }
    JSONPrinter.prototype.print = function (value) {
        var _this = this;
        if (value === null) {
            return "null";
        }
        else if (typeof value === "number") {
            return value.toString();
        }
        else if (typeof value === "string") {
            return "\"".concat(value, "\"");
        }
        else if (typeof value === "boolean") {
            return String(value);
        }
        else if (Array.isArray(value)) {
            return "[".concat(value.map(function (e) { return _this.print(e); }).join(", "), "]");
        }
        else if (typeof value === "object") {
            var pairs = Object.entries(value)
                .map(function (_a) {
                var key = _a[0], value = _a[1];
                return "".concat(_this.print(key), ": ").concat(_this.print(value));
            })
                .join(", ");
            return "{".concat(pairs, "}");
        }
        throw new Error("invalid json value");
    };
    return JSONPrinter;
}());
exports.JSONPrinter = JSONPrinter;
//# sourceMappingURL=JSONPrinter.js.map