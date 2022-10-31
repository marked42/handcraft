function loader(factories, entry) {
    const installedModules = {};

    function __require__(id) {
        if (installedModules[id]) {
            return installedModules[id].exports;
        }

        var mod = (installedModules[id] = {
            exports: {},
            id,
            loaded: false,
        });

        factories[id].call(exports, mod, module.exports, __require__);

        mod.loaded = true;

        return mod.exports;
    }
    // __require__.resolve
    __require__.cache = installedModules;
    __require__.entry = entry;
    __require__.factories = factories;
    __require__.markESModule = markESModule;
    __require__.export = exportValue;
    __require__.importDefault = importDefault;

    // load entry
    __require__(entry);

    function markESModule(exports) {
        Object.defineProperty(exports, "__esModule__", {
            value: true,
            enumerable: true,
            configurable: false,
        });
    }

    function exportValue(exports, name, getter) {
        if (!Object.prototype.hasOwnProperty.call(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                configurable: false,
                get: getter,
            });
        }
    }

    function importDefault(mod) {
        if (mod && mod.__esModule__) {
            return mod["default"];
        }

        return mod;
    }
}

module.exports = loader;
