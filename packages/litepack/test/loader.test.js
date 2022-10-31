const loader = require("../src/loader");

describe("loader", () => {
    it("load entrance module correctly", () => {
        loader(
            {
                "./src": function (module, exports, require) {
                    module.exports = {
                        name: require("./name").name,
                        value: "text",
                    };

                    expect(module.exports).toEqual({
                        name: "tom",
                        value: "text",
                    });
                },
                "./name": function (module, exports, require) {
                    module.exports = {
                        name: "tom",
                    };
                },
            },
            "./src"
        );
    });

    it("cache loaded", () => {
        let counter = 0;
        loader(
            {
                "./src": function (module, exports, require) {
                    counter++;

                    expect(require("./src").counter).toEqual(undefined);

                    module.exports = {
                        counter,
                    };
                },
            },
            "./src"
        );
    });

    it("require default from", () => {
        loader(
            {
                "./src": function (module, exports, require) {
                    expect(require("./hasDefault.js").counter).toEqual(1);
                },
                "./hasDefault.js": function (module, exports, require) {
                    require.markESModule(module.exports);

                    var counter = 1;
                    require.export(module.exports, "counter", () => {
                        return counter;
                    });
                },
            },
            "./src"
        );
    });
});
