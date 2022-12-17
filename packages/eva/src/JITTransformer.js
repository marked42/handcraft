"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JITTransformer = void 0;
var JITTransformer = /** @class */ (function () {
    function JITTransformer() {
    }
    JITTransformer.prototype.transformFunctionDeclaration = function (expr) {
        var fnName = expr[1], parameters = expr[2], body = expr[3];
        // this.assertsSymbol(fnName);
        // this.assertsSymbolArray(parameters);
        // JIT transpile function declaration to variable declaration
        var variableDeclaration = [
            "var",
            fnName,
            ["lambda", parameters, body],
        ];
        return variableDeclaration;
    };
    JITTransformer.prototype.transformSwitchCase = function (expr) {
        var cases = expr.slice(1);
        var ifExpr = ["if"];
        var current = ifExpr;
        for (var i = 0; i < cases.length - 1; i++) {
            var c = cases[i];
            if (!Array.isArray(c)) {
                throw new Error("invalid switch case ".concat(JSON.stringify(c), ", must not be atomic value"));
            }
            var condition = c[0], value = c[1];
            current[1] = condition;
            current[2] = value;
            var next = cases[i + 1];
            if (!Array.isArray(next)) {
                throw new Error("invalid switch case ".concat(JSON.stringify(c), ", must not be atomic value"));
            }
            var nextCondition = next[0], nextValue = next[1];
            if (nextCondition === "else") {
                current[3] = nextValue;
            }
            else {
                var ifExpr_1 = ["if"];
                current[3] = ifExpr_1;
                current = ifExpr_1;
            }
        }
        return ifExpr;
    };
    JITTransformer.prototype.transformForToWhile = function (expr) {
        var initializer = expr[1], condition = expr[2], modifier = expr[3], body = expr[4];
        var whileExpr = [
            "begin",
            initializer,
            ["while", condition, ["begin", body, modifier]],
        ];
        return whileExpr;
    };
    JITTransformer.prototype.transformIncrement = function (expr) {
        var symbol = expr[1];
        return ["set", symbol, ["+", symbol, 1]];
    };
    JITTransformer.prototype.transformDecrement = function (expr) {
        var symbol = expr[1];
        return ["set", symbol, ["-", symbol, 1]];
    };
    JITTransformer.prototype.transformPlusAssignment = function (expr) {
        var symbol = expr[1], step = expr[2];
        return ["set", symbol, ["+", symbol, step]];
    };
    JITTransformer.prototype.transformMinusAssignment = function (expr) {
        var symbol = expr[1], step = expr[2];
        return ["set", symbol, ["-", symbol, step]];
    };
    return JITTransformer;
}());
exports.JITTransformer = JITTransformer;
//# sourceMappingURL=JITTransformer.js.map