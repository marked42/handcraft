"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eva = void 0;
var Environment_1 = require("./Environment");
var callable_1 = require("./callable");
var JITTransformer_1 = require("./JITTransformer");
var ModuleEvaluator_1 = require("./ModuleEvaluator");
var Eva = /** @class */ (function () {
    function Eva(globalEnvironment) {
        if (globalEnvironment === void 0) { globalEnvironment = Environment_1.Environment.createGlobalEnvironment(); }
        this.globalEnvironment = globalEnvironment;
        this.transformer = new JITTransformer_1.JITTransformer();
        this.moduleFolder = process.cwd();
    }
    Eva.prototype.setModuleFolder = function (path) {
        this.moduleFolder = path;
    };
    Eva.prototype.eval = function (expr) {
        return this.evalInEnvironment(expr, this.globalEnvironment);
    };
    Eva.prototype.evalInEnvironment = function (expr, environment) {
        var _this = this;
        if (this.isNumberExpression(expr)) {
            return this.evalNumber(expr);
        }
        if (this.isBooleanExpression(expr)) {
            return this.evalBoolean(expr);
        }
        if (this.isStringExpression(expr)) {
            return this.evalString(expr);
        }
        if (this.isSymbolName(expr)) {
            if (expr === "null") {
                return null;
            }
            return this.evalVariable(expr, environment);
        }
        if (Array.isArray(expr)) {
            if (expr[0] === "var") {
                var name = expr[1], initializer = expr[2];
                this.assertsVariableName(name);
                var initialValue = this.evalInEnvironment(initializer, environment);
                environment.define(name, initialValue);
                return initialValue;
            }
            else if (this.isBlockExpression(expr)) {
                return this.evalBlock(expr, environment);
            }
            else if (expr[0] === "set") {
                var ref = expr[1], initializer = expr[2];
                var initialValue = this.evalInEnvironment(initializer, environment);
                if (Array.isArray(ref) && ref[0] === "prop") {
                    var instance = ref[1], prop = ref[2];
                    this.assertsSymbol(instance);
                    this.assertsSymbol(prop);
                    var classEnv = this.evalInEnvironment(instance, environment);
                    classEnv.set(prop, initialValue);
                    return initialValue;
                }
                this.assertsVariableName(ref);
                environment.set(ref, initialValue);
                return initialValue;
            }
            else if (expr[0] === "if") {
                return this.evalIfExpression(expr, environment);
            }
            else if (expr[0] === "while") {
                return this.evalWhileExpression(expr, environment);
            }
            else if (expr[0] === "for") {
                return this.evalFor(expr, environment);
            }
            else if (expr[0] === "def") {
                // JIT transpile function declaration to variable declaration
                var variableDeclaration = this.transformer.transformFunctionDeclaration(expr);
                return this.evalInEnvironment(variableDeclaration, environment);
            }
            else if (expr[0] === "++") {
                return this.evalInEnvironment(this.transformer.transformIncrement(expr), environment);
            }
            else if (expr[0] === "--") {
                return this.evalInEnvironment(this.transformer.transformDecrement(expr), environment);
            }
            else if (expr[0] === "+=") {
                return this.evalInEnvironment(this.transformer.transformPlusAssignment(expr), environment);
            }
            else if (expr[0] === "-=") {
                return this.evalInEnvironment(this.transformer.transformMinusAssignment(expr), environment);
            }
            else if (expr[0] === "lambda") {
                var parameters = expr[1], body = expr[2];
                this.assertsSymbolArray(parameters);
                var fn = (0, callable_1.createCallableObject)({
                    fnName: "anonymous",
                    parameters: parameters,
                    body: body,
                    environment: environment,
                });
                return fn;
            }
            else if (expr[0] === "switch") {
                return this.evalSwitch(expr, environment);
            }
            else if (expr[0] === "class") {
                return this.evalClass(expr, environment);
            }
            else if (expr[0] === "new") {
                return this.evalNew(expr, environment);
            }
            else if (expr[0] === "prop") {
                return this.evalProp(expr, environment);
            }
            else if (expr[0] === "super") {
                return this.evalSuper(expr, environment);
            }
            else if (expr[0] === "module" || expr[0] === "import") {
                return this.evalImport(expr, environment);
            }
            else {
                var symbol = expr[0], parameters = expr.slice(1);
                var fn = this.evalInEnvironment(symbol, environment);
                var actualParameters = parameters.map(function (p) {
                    return _this.evalInEnvironment(p, environment);
                });
                if ((0, callable_1.isCallableObject)(fn)) {
                    return this.evalCallableObject(fn, actualParameters);
                }
                if (typeof fn === "function") {
                    return fn.apply(void 0, actualParameters);
                }
            }
        }
        throw "Unimplemented";
    };
    // @ts-expect-error ignore
    Eva.prototype.assertsCallableObject = function (expr) {
        if (!(0, callable_1.isCallableObject)(expr)) {
            throw new Error("".concat(JSON.stringify(expr), "\u4E0D\u662Fcallable"));
        }
    };
    // assertsSymbolArray(names: CompoundExpression): asserts names is string[] {
    // 	if (!names.every((name) => this.isStringExpression(name))) {
    // 		throw new Error(`names 不是字符串数组 ${JSON.stringify(names)}`);
    // 	}
    // }
    Eva.prototype.evalImport = function (expr, environment) {
        var moduleEvaluator = (0, ModuleEvaluator_1.createModuleEvaluator)(expr, environment, this.moduleFolder, this);
        return moduleEvaluator.evalModuleDefinition();
    };
    Eva.prototype.evalSuper = function (expr, environment) {
        var name = expr[1];
        this.assertsSymbol(name);
        var classEnv = this.evalInEnvironment(name, environment);
        this.assertsEnvironment(classEnv);
        var parentClass = classEnv.parent;
        this.assertsEnvironment(parentClass);
        return parentClass;
    };
    Eva.prototype.assertsEnvironment = function (expr) {
        if (!(expr instanceof Environment_1.Environment)) {
            throw new Error("".concat(JSON.stringify(expr), " must be environment. "));
        }
    };
    // property read
    Eva.prototype.evalProp = function (expr, environment) {
        var instance = expr[1], name = expr[2];
        // this.assertsSymbol(instance);
        this.assertsSymbol(name);
        var instanceEnv = this.evalInEnvironment(instance, environment);
        var prop = this.evalInEnvironment(name, instanceEnv);
        return prop;
    };
    Eva.prototype.evalNew = function (expr, environment) {
        var _this = this;
        var name = expr[1], parameters = expr.slice(2);
        var classEnv = this.evalInEnvironment(name, environment);
        var constructor = classEnv.lookup("constructor");
        // 特殊处理，类实例也用Environment表示，父节点是classEnv
        var instance = new Environment_1.Environment({}, classEnv);
        var actualParameters = parameters.map(function (p) {
            return _this.evalInEnvironment(p, environment);
        });
        this.evalCallableObject(constructor, __spreadArray([instance], actualParameters, true));
        return instance;
    };
    Eva.prototype.evalClass = function (expr, environment) {
        var name = expr[1], parent = expr[2], body = expr[3];
        this.assertsSymbol(name);
        this.assertsSymbol(parent);
        // 必须保证全局变量被找到
        var parentEnv = this.evalInEnvironment(parent, environment) || environment;
        var classEnv = new Environment_1.Environment({}, 
        // @ts-expect-error ignore for now
        parentEnv);
        this.assertsBlockExpression(body);
        this.evalBlock(body, environment, classEnv);
        this.evalInEnvironment(body, classEnv);
        environment.define(name, classEnv);
        return classEnv;
    };
    Eva.prototype.evalMinusAssignmentDirectly = function (expr, environment) {
        var variable = expr[1], step = expr[2];
        this.assertsSymbol(variable);
        var currentValue = this.evalInEnvironment(variable, environment);
        // @ts-expect-error ignore checking
        this.assertNumberExpression(currentValue);
        var incrementedValue = this.evalInEnvironment(step, environment);
        // @ts-expect-error ignore checking
        this.assertNumberExpression(incrementedValue);
        var value = currentValue - incrementedValue;
        environment.set(variable, value);
        return value;
    };
    Eva.prototype.evalPlusAssignmentDirectly = function (expr, environment) {
        var variable = expr[1], step = expr[2];
        this.assertsSymbol(variable);
        var currentValue = this.evalInEnvironment(variable, environment);
        // @ts-expect-error ignore checking
        this.assertNumberExpression(currentValue);
        var incrementedValue = this.evalInEnvironment(step, environment);
        // @ts-expect-error ignore checking
        this.assertNumberExpression(incrementedValue);
        var value = currentValue + incrementedValue;
        environment.set(variable, value);
        return value;
    };
    Eva.prototype.evalDecrementDirectly = function (expr, environment) {
        var variable = expr[1];
        this.assertsSymbol(variable);
        var currentValue = this.evalInEnvironment(variable, environment);
        // @ts-expect-error ignore checking
        this.assertNumberExpression(currentValue);
        var incrementedValue = 1;
        this.assertNumberExpression(incrementedValue);
        var value = currentValue - incrementedValue;
        environment.set(variable, value);
        return value;
    };
    Eva.prototype.evalIncrementDirectly = function (expr, environment) {
        var variable = expr[1];
        this.assertsSymbol(variable);
        var currentValue = this.evalInEnvironment(variable, environment);
        // @ts-expect-error ignore checking
        this.assertNumberExpression(currentValue);
        var incrementedValue = 1;
        this.assertNumberExpression(incrementedValue);
        var value = currentValue + incrementedValue;
        environment.set(variable, value);
        return value;
    };
    Eva.prototype.evalFor = function (expr, environment) {
        var whileExpr = this.transformer.transformForToWhile(expr);
        return this.evalInEnvironment(whileExpr, environment);
    };
    Eva.prototype.evalForDirectly = function (expr, environment) {
        var initializer = expr[1], condition = expr[2], modifier = expr[3], body = expr[4];
        this.evalInEnvironment(initializer, environment);
        var result = null;
        while (this.evalInEnvironment(condition, environment)) {
            result = this.evalInEnvironment(body, environment);
            this.evalInEnvironment(modifier, environment);
        }
        return result;
    };
    Eva.prototype.evalSwitch = function (expr, environment) {
        var transformed = this.transformer.transformSwitchCase(expr);
        return this.evalInEnvironment(transformed, environment);
    };
    Eva.prototype.directEvalSwitch = function (expr, environment) {
        var cases = expr.slice(1);
        for (var _i = 0, cases_1 = cases; _i < cases_1.length; _i++) {
            var e = cases_1[_i];
            if (!Array.isArray(e)) {
                throw new Error("invalid switch case branch, must be an array.");
            }
            var condition = e[0], value = e[1];
            if (condition === "else" ||
                this.evalInEnvironment(condition, environment)) {
                return this.evalInEnvironment(value, environment);
            }
        }
        throw new Error("invalid switch case, must have else branch");
    };
    Eva.prototype.evalCallableObject = function (fn, actualParameters) {
        var parameters = fn.parameters, body = fn.body, environment = fn.environment;
        var activationRecord = parameters.reduce(function (acc, name, i) {
            acc[name] = actualParameters[i];
            return acc;
        }, {});
        var fnEnv = new Environment_1.Environment(activationRecord, environment);
        return this.evalInEnvironment(body, fnEnv);
    };
    Eva.prototype.isExpression = function (expr) {
        var predicates = [
            this.isStringExpression,
            this.isBooleanExpression,
            this.isNumberExpression,
            this.isSymbolName,
            Array.isArray,
        ];
        return predicates.some(function (p) { return p(expr); });
    };
    Eva.prototype.assertsIfExpression = function (expr) {
        var _this = this;
        if (Array.isArray(expr)) {
            var key = expr[0], condition = expr[1], consequent = expr[2], alternate = expr[3];
            if (key === "if" &&
                [condition, consequent, alternate].every(function (expr) {
                    return _this.isExpression(expr);
                })) {
                return;
            }
        }
        throw new Error("\u8BED\u6CD5\u9519\u8BEF\uFF0C".concat(JSON.stringify(expr), "\u4E0D\u662F\u5408\u6CD5\u7684if\u8868\u8FBE\u5F0F\u3002"));
    };
    Eva.prototype.evalIfExpression = function (expr, environment) {
        var condition = expr[1], consequent = expr[2], alternate = expr[3];
        this.assertsIfExpression(expr);
        if (this.evalInEnvironment(condition, environment)) {
            return this.evalInEnvironment(consequent, environment);
        }
        return this.evalInEnvironment(alternate, environment);
    };
    Eva.prototype.assertsWhileExpression = function (expr) {
        if (Array.isArray(expr)) {
            var key = expr[0], condition = expr[1], body = expr[2];
            if (key === "while" &&
                this.isExpression(condition) &&
                this.isExpression(body)) {
                return true;
            }
        }
        throw new Error("\u8BED\u6CD5\u9519\u8BEF\uFF0C".concat(JSON.stringify(expr), "\u4E0D\u662F\u5408\u6CD5\u7684while\u8868\u8FBE\u5F0F\u3002"));
    };
    Eva.prototype.evalWhileExpression = function (expr, environment) {
        var condition = expr[1], body = expr[2];
        this.assertsWhileExpression(expr);
        var result = null;
        while (this.evalInEnvironment(condition, environment)) {
            result = this.evalInEnvironment(body, environment);
        }
        return result;
    };
    Eva.prototype.isBlockExpression = function (expr) {
        return Array.isArray(expr) && expr[0] === "begin";
    };
    Eva.prototype.assertsBlockExpression = function (expr) {
        if (!this.isBlockExpression(expr)) {
            throw new Error("".concat(JSON.stringify(expr), "\u5FC5\u987B\u662Fblock"));
        }
    };
    Eva.prototype.evalBlock = function (expr, parent, blockEnv) {
        var _this = this;
        if (blockEnv === void 0) { blockEnv = new Environment_1.Environment({}, parent); }
        var values = expr
            .slice(1)
            .map(function (e) { return _this.evalInEnvironment(e, blockEnv); });
        return values[values.length - 1];
    };
    Eva.prototype.isBooleanExpression = function (expr) {
        return typeof expr === "boolean";
    };
    Eva.prototype.evalBoolean = function (expr) {
        return expr;
    };
    Eva.prototype.assertsVariableName = function (name) {
        if (!this.isSymbolName(name)) {
            throw new Error("".concat(JSON.stringify(name), "\u4E0D\u662F\u53D8\u91CF\u540D\u79F0"));
        }
    };
    /**
     * symbol includes comparison and arithmetic operation characters < <= ...
     */
    Eva.prototype.isSymbolName = function (name) {
        if (typeof name !== "string") {
            return false;
        }
        var namePattern = /^[a-zA-Z+\-*/><=!][a-zA-Z0-9+\-*/><=!_]*$/;
        return namePattern.test(name);
    };
    Eva.prototype.evalVariable = function (name, environment) {
        return environment.lookup(name);
    };
    Eva.prototype.isStringExpression = function (expr) {
        return (typeof expr === "string" &&
            expr[0] === '"' &&
            expr.slice(-1) === '"');
    };
    Eva.prototype.assertStringExpression = function (expr) {
        if (!this.isStringExpression(expr)) {
            throw new Error("\u8868\u8FBE\u5F0F".concat(JSON.stringify(expr), "\u7684\u53C2\u6570\u5FC5\u987B\u662F\u5B57\u7B26\u4E32"));
        }
    };
    Eva.prototype.assertsSymbol = function (expr) {
        if (!this.isSymbolName(expr)) {
            throw new Error("".concat(JSON.stringify(expr), "\u4E0D\u662F\u5408\u6CD5\u7684\u7B26\u53F7"));
        }
    };
    Eva.prototype.assertsSymbolArray = function (expr) {
        var _this = this;
        if (!Array.isArray(expr) || expr.some(function (e) { return !_this.isSymbolName(e); })) {
            throw new Error("\u51FD\u6570\u53C2\u6570\u5F62\u5F0F".concat(JSON.stringify(expr), "\u4E0D\u5408\u6CD5\uFF0C\u5FC5\u987B\u662F\u7B26\u53F7\u6570\u7EC4"));
        }
    };
    Eva.prototype.evalString = function (expr) {
        this.assertStringExpression(expr);
        return expr.slice(1, -1);
    };
    Eva.prototype.evalNumber = function (expr) {
        this.assertNumberExpression(expr);
        return expr;
    };
    Eva.prototype.isNumberExpression = function (expr) {
        return typeof expr === "number";
    };
    Eva.prototype.assertNumberExpression = function (expr) {
        if (!this.isNumberExpression(expr)) {
            throw new Error("\u8868\u8FBE\u5F0F".concat(JSON.stringify(expr), "\u7684\u53C2\u6570\u5FC5\u987B\u662F\u6570\u5B57"));
        }
    };
    return Eva;
}());
exports.Eva = Eva;
//# sourceMappingURL=Eva.js.map