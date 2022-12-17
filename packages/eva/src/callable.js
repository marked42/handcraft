"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCallableObject = exports.createCallableObject = void 0;
var internalId = 0x12345678;
var createCallableObject = function (options) {
    var callable = __assign({}, options);
    // @ts-expect-error internal id
    callable["__fn__"] = internalId;
    return callable;
};
exports.createCallableObject = createCallableObject;
function isCallableObject(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        // @ts-expect-error allow
        (obj === null || obj === void 0 ? void 0 : obj["__fn__"]) === internalId);
}
exports.isCallableObject = isCallableObject;
//# sourceMappingURL=callable.js.map