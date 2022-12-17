"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONParser = void 0;
var Token_1 = require("./Token");
var JSONParser = /** @class */ (function () {
    function JSONParser(tokenStream) {
        this.tokenStream = tokenStream;
    }
    JSONParser.prototype.parseObject = function () {
        var _this = this;
        var object = {};
        this.tokenStream.eat(Token_1.TokenType.LeftParenthesis);
        if (this.tokenStream.match(Token_1.TokenType.RightParenthesis)) {
            this.tokenStream.eat();
            return object;
        }
        var parseObjectMember = function () {
            var nextToken = _this.tokenStream.peek();
            _this.tokenStream.eat(Token_1.TokenType.String, "Object member should start with string.");
            _this.tokenStream.eat(Token_1.TokenType.Colon);
            var value = _this.parseValue();
            object[nextToken.value] = value;
        };
        parseObjectMember();
        while (this.tokenStream.match(Token_1.TokenType.Comma)) {
            this.tokenStream.eat();
            parseObjectMember();
        }
        this.tokenStream.eat(Token_1.TokenType.RightParenthesis);
        return object;
    };
    JSONParser.prototype.parseString = function () {
        var token = this.tokenStream.eat(Token_1.TokenType.String);
        // TODO: expectToken should narrow token to StringToken type
        return token.value;
    };
    JSONParser.prototype.parseBoolean = function () {
        var token = this.tokenStream.eat(Token_1.TokenType.Boolean);
        return token.value;
    };
    JSONParser.prototype.parseNull = function () {
        this.tokenStream.eat(Token_1.TokenType.Null);
        return null;
    };
    JSONParser.prototype.parseArray = function () {
        var _this = this;
        this.tokenStream.eat(Token_1.TokenType.LeftSquareBracket);
        var result = [];
        if (this.tokenStream.match(Token_1.TokenType.RightSquareBracket)) {
            this.tokenStream.eat();
            return result;
        }
        var consumeElement = function () {
            var element = _this.parseValue();
            result.push(element);
        };
        consumeElement();
        while (this.tokenStream.match(Token_1.TokenType.Comma)) {
            this.tokenStream.eat();
            consumeElement();
        }
        this.tokenStream.eat(Token_1.TokenType.RightSquareBracket);
        return result;
    };
    JSONParser.prototype.parseNumber = function () {
        // TODO: type narrowing
        var token = this.tokenStream.eat(Token_1.TokenType.Number);
        return token.value;
    };
    /**
     * 为了处理单个数字是非法的情况 00
     * 区分parse和parseValue，
     * parseValue解析成功后，后续还可以有输入
     * parse解析成功后，输入必须完结
     *
     * 一个token那个字符开始到那个字符结束
     * 1. 最长规则？
     * 2. 错误形式，明确token边界的话方便检测错误形式，给出友好的报错信息
     *
     * 考虑非递归实现，迭代实现中，如果解析结束后，栈内有多个json值，则输入非法
     */
    JSONParser.prototype.parse = function () {
        var value = this.parseValue();
        this.tokenStream.expect(Token_1.TokenType.EOF, "Input should end here.");
        return value;
    };
    JSONParser.prototype.parseValue = function () {
        var token = this.tokenStream.peek();
        var value;
        switch (token.type) {
            case Token_1.TokenType.Boolean:
                value = this.parseBoolean();
                break;
            case Token_1.TokenType.Null:
                value = this.parseNull();
                break;
            case Token_1.TokenType.String:
                value = this.parseString();
                break;
            case Token_1.TokenType.LeftParenthesis:
                value = this.parseObject();
                break;
            case Token_1.TokenType.LeftSquareBracket:
                value = this.parseArray();
                break;
            case Token_1.TokenType.Number:
                value = this.parseNumber();
                break;
            default:
                this.tokenStream.throwUnexpectedTokenError();
        }
        return value;
    };
    return JSONParser;
}());
exports.JSONParser = JSONParser;
//# sourceMappingURL=JSONParser.js.map