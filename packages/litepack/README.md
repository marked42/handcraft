# 介绍

1. 模块的概念，封装 module, module.exports
1. 模块加载 require 函数
1. 模块支持 cache，有加载中的状态，加载完成状态 loaded
1. 异步模块，模块有 loading 状态， jsonp
1. 编译后模块的公开地址 publicPath
1. 处理 esModule default 功能。
1. 错误处理 模块加载失败？
1. code splitting deferred modules
1. global.js 和 module.js 干嘛的

## ESModule/CommonJS 交互

对于 ESModule 编译到 CommonJS 时，使用`__esModule__`属性表示，并且默认导入，默认导出要对应处理。

```js
function markESModule(exports) {
    Object.defineProperty(exports, "__esModule__", {
        value: true,
        enumerable: true,
        configurable: false,
    });
}

// ESModule 的 导入导出是 live binding，实事更新，只读，相当于getter
function defineExportName(exports, name, getters) {
    if (!Object.prototype.hasOwnProperty.call(exports, name)) {
        Object.defineProperty(exports, name, {
            enumerable: true,
            configurable: false,
            get: getter,
        });
    }
}

function getDefault(mod) {
    if (mod && mod.__esModule__) {
        return mod["default"];
    }

    return mod;
}
```

为什么这么设计，default 也要设计成 live binding 同样使用 getter 实现，使用了名字'a'。

```js
__webpack_require__.n = function (module) {
    var getter =
        module && module.__esModule
            ? function getDefault() {
                  return module["default"];
              }
            : function getModuleExports() {
                  return module;
              };
    __webpack_require__.d(getter, "a", getter);
    return getter;
};

// a 是一个获得默认导出值的getter属性
vue__WEBPACK_IMPORTED_MODULE_0___default.a({});
```

webpack 的每个模块格式为什么设计成`eval('')`形式执行？

# 输出模块格式

libraryTarget: umd/amd/commonjs/commonjs2/var

# 同步拆包

https://www.njleonzhang.com/2019/02/12/webpack-bundle-3.html

# 异步拆包

https://www.njleonzhang.com/2019/02/12/webpack-bundle-3.html
https://www.nuobel.com/blog/2020/11/webpack-how-to-load-chunks/

https://webpack.js.org/concepts/under-the-hood/

https://webpack.js.org/concepts/under-the-hood/
https://www.youtube.com/watch?v=0iKZEkJgkOw
https://frontendmasters.com/teachers/sean-larkin/

https://www.bilibili.com/video/BV1aE411i7gY

# preload & prefetch

https://webpack.js.org/guides/code-splitting/

https://medium.com/webpack/link-rel-prefetch-preload-in-webpack-51a52358f84c

https://github.com/vuejs/preload-webpack-plugin

# Module Federation

1. https://medium.com/swlh/webpack-5-module-federation-a-game-changer-to-javascript-architecture-bcdd30e02669
1. https://www.youtube.com/watch?v=D3XYAx30CNc&feature=emb_title

webpackChunkName
webpackMode: 'lazy' | 'lazy-once' | 'eager'

lazy-once 将多个异步 chunk 合并成一个，在开发模式下提高打包速度。

```js
if (process.env.NOD_ENV === "development") {
    import(/* webpackMode: "lazy-once" */ "./math");
} else {
    import("./math");
}
```
