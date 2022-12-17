"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var codePoints_1 = require("../src/codePoints");
it("getStringCodePoints", function () {
    var input = "null";
    expect((0, codePoints_1.getStringCodePoints)(input)).toMatchInlineSnapshot("\nArray [\n  110,\n  117,\n  108,\n  108,\n]\n");
});
//# sourceMappingURL=codePoints.js.map