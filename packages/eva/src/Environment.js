"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var Environment = /** @class */ (function () {
    function Environment(record, parent) {
        if (record === void 0) { record = {}; }
        if (parent === void 0) { parent = null; }
        this.record = record;
        this.parent = parent;
    }
    Environment.prototype.has = function (name) {
        return Object.keys(this.record).includes(name);
    };
    Environment.prototype.define = function (name, value) {
        if (this.has(name)) {
            throw new Error("\u53D8\u91CF".concat(name, "\u5DF2\u7ECF\u5B58\u5728\uFF0C\u4E0D\u80FD\u91CD\u590D\u5B9A\u4E49\uFF01"));
        }
        this.record[name] = value;
    };
    Environment.prototype.resolve = function (name) {
        /* eslint-disable-next-line */
        var env = this;
        while (env) {
            if (env.has(name)) {
                return env;
            }
            env = env.parent;
        }
        return null;
    };
    Environment.prototype.lookup = function (name) {
        var env = this.resolve(name);
        if (!env) {
            this.throwOnUndefinedVariable(name);
        }
        return env.record[name];
    };
    Environment.prototype.set = function (name, value) {
        var env = this.resolve(name);
        if (!env) {
            // implicitly create variable
            this.define(name, value);
            return value;
        }
        return (env.record[name] = value);
    };
    Environment.prototype.throwOnUndefinedVariable = function (name) {
        throw new ReferenceError("\u53D8\u91CF".concat(name, "\u4E0D\u5B58\u5728!"));
    };
    Environment.createGlobalEnvironment = function () {
        return new Environment({
            PI: 3.1415926,
            print: function () {
                var msg = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    msg[_i] = arguments[_i];
                }
                console.log.apply(console, msg);
                return null;
            },
            "+": function (op1, op2) {
                if (typeof op1 === "number" && op2 === void 0) {
                    return op1;
                }
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 + op2;
                }
                throw new Error("plus unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            "-": function (op1, op2) {
                if (typeof op1 === "number" && op2 === void 0) {
                    return -op1;
                }
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 - op2;
                }
                throw new Error("minus unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            "*": function (op1, op2) {
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 * op2;
                }
                throw new Error("* unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            "/": function (op1, op2) {
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 / op2;
                }
                throw new Error("/ unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            "==": function (op1, op2) {
                return op1 === op2;
            },
            "!=": function (op1, op2) {
                return op1 !== op2;
            },
            ">": function (op1, op2) {
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 > op2;
                }
                throw new Error("> unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            ">=": function (op1, op2) {
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 >= op2;
                }
                throw new Error(">= unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            "<": function (op1, op2) {
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 < op2;
                }
                throw new Error("< unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
            "<=": function (op1, op2) {
                if (typeof op1 === "number" && typeof op2 === "number") {
                    return op1 <= op2;
                }
                throw new Error("<= unsupported for operators ".concat(JSON.stringify(op1), " and ").concat(JSON.stringify(op2)));
            },
        });
    };
    return Environment;
}());
exports.Environment = Environment;
//# sourceMappingURL=Environment.js.map