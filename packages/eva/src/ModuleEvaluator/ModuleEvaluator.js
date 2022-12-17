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
exports.NamedModuleEvaluator = exports.NamespaceModuleEvaluator = exports.ExternalModuleEvaluator = exports.InlineModuleEvaluator = exports.createModuleEvaluator = exports.ModuleEvaluator = void 0;
var path = require("path");
var fs = require("fs");
var Environment_1 = require("../Environment");
var parser_1 = require("../parser");
var ModuleEvaluator = /** @class */ (function () {
    function ModuleEvaluator(name, expr, environment, moduleFolder, interpreter) {
        this.name = name;
        this.expr = expr;
        this.environment = environment;
        this.moduleFolder = moduleFolder;
        this.interpreter = interpreter;
    }
    ModuleEvaluator.prototype.evalModuleBody = function (expr) {
        var environment = this.environment;
        var name = expr[1], body = expr[2];
        this.interpreter.assertsSymbol(name);
        this.interpreter.assertsBlockExpression(body);
        var moduleEnv = new Environment_1.Environment({}, environment);
        this.interpreter.evalBlock(body, environment, moduleEnv);
        return moduleEnv;
    };
    ModuleEvaluator.prototype.evalModuleDefinition = function () {
        var moduleExpression = this.loadModule();
        var modEnv = this.evalModuleBody(moduleExpression);
        return this.installModule(modEnv);
    };
    return ModuleEvaluator;
}());
exports.ModuleEvaluator = ModuleEvaluator;
function createModuleEvaluator(expr, environment, moduleFolder, interpreter) {
    var tag = expr[0], name = expr[1], importedNames = expr.slice(2);
    interpreter.assertsSymbol(name);
    var isInlineModule = tag === "module";
    if (isInlineModule) {
        return new InlineModuleEvaluator(name, expr, environment, moduleFolder, interpreter);
    }
    var isNamespaceImportModule = tag === "import" && importedNames.length === 0;
    if (isNamespaceImportModule) {
        return new NamespaceModuleEvaluator(name, expr, environment, moduleFolder, interpreter);
    }
    var isNamedImportModule = tag === "import" && importedNames.length > 0;
    if (isNamedImportModule) {
        interpreter.assertsSymbolArray(importedNames);
        return new NamedModuleEvaluator(name, expr, environment, moduleFolder, interpreter, importedNames);
    }
    throw new Error("invalid module definition");
}
exports.createModuleEvaluator = createModuleEvaluator;
var InlineModuleEvaluator = /** @class */ (function (_super) {
    __extends(InlineModuleEvaluator, _super);
    function InlineModuleEvaluator(name, expr, environment, moduleFolder, interpreter) {
        var _this = _super.call(this, name, expr, environment, moduleFolder, interpreter) || this;
        _this.name = name;
        _this.expr = expr;
        _this.environment = environment;
        _this.moduleFolder = moduleFolder;
        _this.interpreter = interpreter;
        return _this;
    }
    InlineModuleEvaluator.prototype.loadModule = function () {
        var expr = this.expr;
        // load module
        var name = expr[1], body = expr[2];
        this.interpreter.assertsSymbol(name);
        this.interpreter.assertsBlockExpression(body);
        return expr;
    };
    // 重复的情况，使用函数式组合更合适
    InlineModuleEvaluator.prototype.installModule = function (modEnv) {
        // install
        this.environment.define(this.name, modEnv);
        return modEnv;
    };
    return InlineModuleEvaluator;
}(ModuleEvaluator));
exports.InlineModuleEvaluator = InlineModuleEvaluator;
var ExternalModuleEvaluator = /** @class */ (function (_super) {
    __extends(ExternalModuleEvaluator, _super);
    function ExternalModuleEvaluator(name, expr, environment, moduleFolder, interpreter) {
        var _this = _super.call(this, name, expr, environment, moduleFolder, interpreter) || this;
        _this.name = name;
        _this.expr = expr;
        _this.environment = environment;
        _this.moduleFolder = moduleFolder;
        _this.interpreter = interpreter;
        return _this;
    }
    ExternalModuleEvaluator.prototype.loadModule = function () {
        var _a = this.expr, moduleName = _a[1], importedNames = _a.slice(2);
        this.interpreter.assertsSymbol(moduleName);
        this.interpreter.assertsSymbolArray(importedNames);
        var moduleFilePath = path.join(this.moduleFolder, "".concat(moduleName, ".eva"));
        var moduleFileContent = fs.readFileSync(moduleFilePath, {
            encoding: "utf-8",
        });
        var moduleExpr = parser_1.EvaParser.parse("(begin ".concat(moduleFileContent, ")"));
        var wrapper = ["module", moduleName, moduleExpr];
        return wrapper;
    };
    return ExternalModuleEvaluator;
}(ModuleEvaluator));
exports.ExternalModuleEvaluator = ExternalModuleEvaluator;
var NamespaceModuleEvaluator = /** @class */ (function (_super) {
    __extends(NamespaceModuleEvaluator, _super);
    function NamespaceModuleEvaluator(name, expr, environment, moduleFolder, interpreter) {
        var _this = _super.call(this, name, expr, environment, moduleFolder, interpreter) || this;
        _this.name = name;
        _this.expr = expr;
        _this.environment = environment;
        _this.moduleFolder = moduleFolder;
        _this.interpreter = interpreter;
        return _this;
    }
    NamespaceModuleEvaluator.prototype.installModule = function (modEnv) {
        this.environment.define(this.name, modEnv);
        return modEnv;
    };
    return NamespaceModuleEvaluator;
}(ExternalModuleEvaluator));
exports.NamespaceModuleEvaluator = NamespaceModuleEvaluator;
var NamedModuleEvaluator = /** @class */ (function (_super) {
    __extends(NamedModuleEvaluator, _super);
    function NamedModuleEvaluator(name, expr, environment, moduleFolder, interpreter, importNames) {
        var _this = _super.call(this, name, expr, environment, moduleFolder, interpreter) || this;
        _this.name = name;
        _this.expr = expr;
        _this.environment = environment;
        _this.moduleFolder = moduleFolder;
        _this.interpreter = interpreter;
        _this.importNames = importNames;
        return _this;
    }
    NamedModuleEvaluator.prototype.installModule = function (modEnv) {
        var _this = this;
        this.importNames.forEach(function (name) {
            _this.environment.define(name, modEnv.lookup(name));
        });
        var lastName = this.importNames[this.importNames.length - 1];
        return this.environment.lookup(lastName);
    };
    return NamedModuleEvaluator;
}(ExternalModuleEvaluator));
exports.NamedModuleEvaluator = NamedModuleEvaluator;
//# sourceMappingURL=ModuleEvaluator.js.map