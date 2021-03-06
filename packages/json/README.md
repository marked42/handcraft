# JSON

1. JSON parser
1. [如何编写一个 JSON 解析器](https://www.liaoxuefeng.com/article/994977272296736)
1. [写一个 JSON、XML 或 YAML 的 Parser 的思路是什么？](https://www.zhihu.com/question/24640264)
1. [从一个 JSON.parse 错误深入研究 JavaScript 的转义字符](https://zhuanlan.zhihu.com/p/31030352)
1. [V8 json-parser](https://github.com/v8/v8/blob/6.4.286/src/json-parser.cc)
1. [V8 json-stringifier](https://github.com/v8/v8/blob/6.4.286/src/json-stringifier.cc)

支持的值类型

1. Object `{}` `{ "a": "b" }` `{ "a": "b", "c": "d" }` 嵌套形式
1. Array `[]` `[ "a" ]` `[ "a", "b" ]` 嵌套形式
1. Number `1.2`
1. String `"a"`
1. Null `null`
1. Boolean `true` `false`

手写解析的注意点

1. 区分 peek/next/ expect 的操作
1. 注意消耗输出进行状态转移的时候记得调用 next

```js
// 0次或者1次
// a?

if (first(a)) {
	// a
}

// 串联
a b


// 选择 分支选择如果不能到达接受态，那么在非法输入下抛错
a | b
if (first(a)) {

} else if (first(b)) {

} else {

}

// 0次或者多次
a*
while (first(a)) {

}


// 1次或者多次
a+
first(a)
// a
while (first(a)) {

}

if (!first(a)) {
    // error
}
while (first(a)) {

}

```

错误输入可以提前抛出异常

ecma262 的 11.8.4

https://github.com/v8/v8/blob/6.4.286/src/json-parser.cc
https://github.com/v8/v8/blob/6.4.286/src/json-stringifier.cc

## 类型推断问题

1. use never to specify a function throws error
1. assert function

```ts
// number
function getNumber(val: number) {
	if (val === 1) {
		return 1;
	}

	throw new Error("invalid");
}

const error = () => {
	throw new Error("invalid");
};

// number | undefined
function getNumber1(val: number) {
	if (val === 1) {
		return 1;
	}

	error();
}
```
