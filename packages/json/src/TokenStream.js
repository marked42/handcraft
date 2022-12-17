"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenStream = void 0;
var codePoints_1 = require("./codePoints");
var Token_1 = require("./Token");
var TokenStream = /** @class */ (function () {
    function TokenStream(characterStream) {
        this.characterStream = characterStream;
        this.token = null;
    }
    TokenStream.prototype.peek = function () {
        if (!this.token) {
            this.token = this.doPeek();
        }
        return this.token;
    };
    // TODO: narrow down token type
    TokenStream.prototype.eat = function (type, message) {
        if (type !== void 0) {
            this.expect(type, message);
        }
        var token = this.peek();
        this.token = null;
        return token;
    };
    TokenStream.prototype.match = function (type) {
        return this.peek().type === type;
    };
    TokenStream.prototype.expect = function (tokenType, message) {
        var token = this.peek();
        var fallbackMessage = "Expect ".concat(tokenType, " but get ").concat(JSON.stringify(token));
        if (tokenType !== token.type) {
            this.throwUnexpectedTokenError(message || fallbackMessage);
        }
    };
    TokenStream.prototype.throwUnexpectedTokenError = function (message) {
        throw new Error("Unexpected token at position ".concat(this.characterStream.codePointIndex, " in JSON. ").concat(message || ""));
    };
    TokenStream.prototype.doPeek = function () {
        this.characterStream.skipWhitespaceCharacters();
        var char = this.characterStream.peek();
        switch (char) {
            case "n".codePointAt(0):
                this.characterStream.eat("null");
                return {
                    type: Token_1.TokenType.Null,
                };
            case "t".codePointAt(0):
                this.characterStream.eat("true");
                return {
                    type: Token_1.TokenType.Boolean,
                    value: true,
                };
            case "f".codePointAt(0):
                this.characterStream.eat("false");
                return {
                    type: Token_1.TokenType.Boolean,
                    value: false,
                };
            case "{".codePointAt(0):
                this.characterStream.eat("{");
                return { type: Token_1.TokenType.LeftParenthesis };
            case "}".codePointAt(0):
                this.characterStream.eat("}");
                return { type: Token_1.TokenType.RightParenthesis };
            case "[".codePointAt(0):
                this.characterStream.eat("[");
                return { type: Token_1.TokenType.LeftSquareBracket };
            case "]".codePointAt(0):
                this.characterStream.eat("]");
                return { type: Token_1.TokenType.RightSquareBracket };
            case ":".codePointAt(0):
                this.characterStream.eat(":");
                return { type: Token_1.TokenType.Colon };
            case ",".codePointAt(0):
                this.characterStream.eat(",");
                return { type: Token_1.TokenType.Comma };
            case '"'.codePointAt(0):
                return this.parseStringToken();
        }
        var isNumberTokenStart = function (char) {
            return (0, codePoints_1.isDecimalDigit)(char) || (0, codePoints_1.isSameCodePoint)(char, "-");
        };
        if (isNumberTokenStart(char)) {
            return this.parseNumberToken();
        }
        if ((0, codePoints_1.isEOFCharacter)(char)) {
            return { type: Token_1.TokenType.EOF };
        }
        this.reportInvalidToken();
    };
    TokenStream.prototype.reportInvalidToken = function (message) {
        if (message === void 0) { message = ""; }
        throw new Error("Invalid token character at position ".concat(this.characterStream.codePointIndex, " in JSON. ").concat(message));
    };
    TokenStream.prototype.parseStringToken = function () {
        var codePoints = [];
        this.characterStream.expect('"', "expect string to begin with double quote");
        this.characterStream.advance(1);
        for (;;) {
            var char = this.characterStream.peek();
            if ((0, codePoints_1.isControlCharacter)(char)) {
                this.reportInvalidToken("Controls characters U+0000 ~ U+001F are not allowed in string.");
            }
            if (this.characterStream.match("\n")) {
                this.reportInvalidToken("Character newline is not allowed in string.");
            }
            if ((0, codePoints_1.isEOFCharacter)(char)) {
                this.reportInvalidToken("Early end of input is not allowed in string.");
            }
            if (this.characterStream.match("\\")) {
                this.characterStream.advance(1);
                codePoints.push(this.parseEscapeSequence());
            }
            else if (this.characterStream.match('"')) {
                break;
            }
            else {
                // normal character
                codePoints.push(char);
                this.characterStream.advance(1);
            }
        }
        this.characterStream.advance(1);
        return {
            type: Token_1.TokenType.String,
            // implicitly handles surrogate pair
            value: String.fromCodePoint.apply(String, codePoints),
        };
    };
    TokenStream.prototype.parseEscapeSequence = function () {
        if (this.characterStream.match("u")) {
            this.characterStream.advance(1);
            return this.parseUnicodeEscapeSequence();
        }
        return this.parseSingleCharacterEscapeSequence();
    };
    TokenStream.prototype.parseSingleCharacterEscapeSequence = function () {
        var _this = this;
        var _a;
        var validSingleEscape = [
            ['"', '"'],
            ["\\", "\\"],
            ["/", "/"],
            ["b", "\b"],
            ["f", "\f"],
            ["r", "\r"],
            ["n", "\n"],
            ["t", "\t"],
        ];
        var escape = validSingleEscape.find(function (_a) {
            var c = _a[0];
            return _this.characterStream.match(c);
        });
        var cp = (_a = escape === null || escape === void 0 ? void 0 : escape[1]) === null || _a === void 0 ? void 0 : _a.codePointAt(0);
        if (typeof cp === "number") {
            this.characterStream.advance(1);
            return cp;
        }
        this.reportInvalidToken("Invalid single character escape sequence \\".concat(String.fromCodePoint(this.characterStream.peek()), " is not allowed in string."));
    };
    TokenStream.prototype.parseUnicodeEscapeSequence = function () {
        var _this = this;
        var invalidUnicodeEscapeSequence = [0, 1, 2, 3].some(function (i) { return !_this.characterStream.match(codePoints_1.isHexDigit, i); });
        var invalidSequence = [0, 1, 2, 3]
            .map(function (i) { return _this.characterStream.peek(i); })
            .join("");
        if (invalidUnicodeEscapeSequence) {
            this.reportInvalidToken("Invalid unicode escape sequence \\u".concat(invalidSequence, " is not allowed in string."));
        }
        var codePoint = (0, codePoints_1.getHexDigitsMathematicalValue)(this.characterStream.peek(0), this.characterStream.peek(1), this.characterStream.peek(2), this.characterStream.peek(3));
        this.characterStream.advance(4);
        return codePoint;
    };
    TokenStream.prototype.parseNumberToken = function () {
        var sign = this.parseNumberTokenMinusSign();
        var integral = this.parseNumberTokenIntegral();
        var fraction = this.parseNumberTokenFraction();
        var exponent = this.parseNumberTokenExponent();
        var base = sign * (integral + fraction);
        return {
            type: Token_1.TokenType.Number,
            value: base * exponent,
        };
    };
    TokenStream.prototype.parseNumberTokenMinusSign = function () {
        var sign = 1;
        // minus sign
        if (this.characterStream.match("-")) {
            this.characterStream.advance(1);
            sign = -1;
        }
        return sign;
    };
    TokenStream.prototype.parseNumberTokenIntegral = function () {
        // integral
        var integral = 0;
        if (this.characterStream.match("0")) {
            this.characterStream.advance(1);
        }
        else if (this.characterStream.match(codePoints_1.isDecimalDigitOneToNine)) {
            integral = (0, codePoints_1.getDecimalDigitMathematicalValue)(this.characterStream.peek());
            this.characterStream.advance(1);
            while (this.characterStream.match(codePoints_1.isDecimalDigit)) {
                integral =
                    integral * 10 +
                        (0, codePoints_1.getDecimalDigitMathematicalValue)(this.characterStream.peek());
                this.characterStream.advance(1);
            }
        }
        else {
            this.reportInvalidToken("Number integral part should not start with ".concat(this.characterStream.peek(), ", only 0 ~ 9 are allowed."));
        }
        return integral;
    };
    TokenStream.prototype.parseNumberTokenFraction = function () {
        var fractionDigitCount = 0;
        var fraction = 0;
        if (this.characterStream.match(".")) {
            this.characterStream.advance(1);
            if (!this.characterStream.match(codePoints_1.isDecimalDigit)) {
                this.reportInvalidToken("Number fraction part cannot contain character ".concat(this.characterStream.peek(), ", only 0 ~ 9 are allowed."));
            }
            while (this.characterStream.match(codePoints_1.isDecimalDigit)) {
                fractionDigitCount++;
                var significance = Math.pow(10, -fractionDigitCount);
                fraction +=
                    significance *
                        (0, codePoints_1.getHexDigitMathematicalValue)(this.characterStream.peek());
                this.characterStream.advance(1);
            }
        }
        return fraction;
    };
    TokenStream.prototype.parseNumberTokenExponent = function () {
        // exponent
        var exponent = 0;
        var sign = 1;
        if (this.characterStream.match("e") ||
            this.characterStream.match("E")) {
            this.characterStream.advance(1);
            if (this.characterStream.match("+")) {
                this.characterStream.advance(1);
            }
            else if (this.characterStream.match("-")) {
                sign = -1;
                this.characterStream.advance(1);
            }
            if (!this.characterStream.match(codePoints_1.isDecimalDigit)) {
                this.reportInvalidToken("Number exponent cannot contain character ".concat(this.characterStream.peek(), "."));
            }
            while (this.characterStream.match(codePoints_1.isDecimalDigit)) {
                exponent =
                    exponent * 10 +
                        (0, codePoints_1.getDecimalDigitMathematicalValue)(this.characterStream.peek());
                this.characterStream.advance(1);
            }
        }
        return Math.pow(10, exponent * sign);
    };
    return TokenStream;
}());
exports.TokenStream = TokenStream;
//# sourceMappingURL=TokenStream.js.map