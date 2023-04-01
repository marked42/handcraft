const { TokenStream, InputStream, parse } = require("./parser");
const { make_js } = require("./code-gen");
const { has_side_effects } = require("./improvement");
const uglifyjs = require("uglify-js");

var FALSE = { type: "bool", value: false };
var TRUE = { type: "bool", value: true };

// these are global
var GENSYM = 0;
/**
 * 生成unique name
 */
function gensym(name) {
    if (!name) name = "";
    name = "β_" + name;
    return name + ++GENSYM;
}

function to_cps(exp, k) {
    return cps(exp, k);

    function cps(exp, k) {
        switch (exp.type) {
            case "num":
            case "bool":
            case "str":
            case "var":
                return cps_atom(exp, k);
            case "prog":
                return cps_prog(exp, k);
            case "assign":
            case "binary":
                return cps_binary(exp, k);
            case "if":
                return cps_if(exp, k);
            case "lambda":
                return cps_lambda(exp, k);
            case "let":
                return cps_let(exp, k);
            case "call":
                return cps_call(exp, k);
            default:
                throw new Error(
                    "Dont known how to make_js for " + JSON.stringify(exp)
                );
        }
    }

    function cps_atom(exp, k) {
        return k(exp);
    }

    // function cps_body(body, k) {
    //     if (body.length == 0) return k([]);
    //     if (body.length == 1) return cps(body[0], k);
    //     return cps(body[0], function (first) {
    //         const val = cps_body(body.slice(1), k);
    //         // 嵌套
    //         return k([first, ...val]);
    //     });
    // }
    // return cps_body(exp.prog, (prog) => {
    //     return k({ type: "prog", prog });
    // });

    // TODO: 必须生成嵌套的形式，保证求值顺序？
    function cps_prog(exp, k) {
        return (function loop(body) {
            if (body.length == 0) return k(FALSE);
            // 忽略第一个没有副作用的语句
            if (!has_side_effects(body[0])) {
                return k(loop(body.slice(1)));
            }

            if (body.length == 1) return cps(body[0], k);
            return cps(body[0], function (first) {
                const val = loop(body.slice(1));
                // 嵌套
                return k({
                    type: "prog",
                    prog: [first, val],
                });
            });
        })(exp.prog);
    }

    // TODO: 一维数组的结果不对，这样代表所有语句并行处理，然后输出结果，实际的过程是
    // 语句有从前到后的顺序处理，前边语句的处理作为后边语句的输入
    // if 语句会多次调用 k。
    // function cps_prog(exp, k) {
    //     const prog = new Array(exp.prog.length);
    //     function loop(body, i) {
    //         if (i < body.length) {
    //             return cps(body[i], (val) => {
    //                 prog[i] = val;
    //                 console.log("set val: ", prog);
    //                 return loop(body, i + 1);
    //             });
    //         } else {
    //             return k({
    //                 type: "prog",
    //                 prog,
    //             });
    //         }
    //     }

    //     return loop(exp.prog, 0);
    // }

    function cps_binary(exp, k) {
        return cps(exp.left, (left) => {
            return cps(exp.right, (right) => {
                // TODO: 不调用k会怎么样？
                return k({
                    type: exp.type,
                    operator: exp.operator,
                    left,
                    right,
                });
            });
        });
    }

    // function cps_if(exp, k) {
    //     return cps(exp.cond, function (cond) {
    //         const t = cps(exp.then, k);
    //         const e = cps(exp.else, k);
    //         const val = {
    //             type: "if",
    //             cond: cond,
    //             then: t,
    //             else: e,
    //         };
    //         return val;
    //     });
    // }

    // avoid code explosion exponentially
    function cps_if(exp, k) {
        return cps(exp.cond, function (cond) {
            const cont = gensym("I");
            const args = [make_continuation(k)];

            const newK = function (result) {
                return {
                    type: "call",
                    func: { type: "var", value: cont },
                    args: [result],
                };
            };
            return {
                type: "call",
                func: {
                    type: "lambda",
                    vars: [cont],
                    body: {
                        type: "if",
                        cond,
                        then: cps(exp.then, newK),
                        else: cps(exp.else || FALSE, newK),
                    },
                },
                args,
            };
        });
    }

    /**
     * λ(x) x + 1;
     * 转换为
     * λ(K, x){ K(x + 1) }
     *
     * 三个步骤
     * 1. 转换得到的函数参数最前边增加一个代表continuation
     * 2. 转换得到的函数体 应该调用continuation，将原来函数体作为参数，表示返回结果
     */
    function cps_lambda(exp, k) {
        const cont = gensym("k");

        const body = cps(exp.body, (body) => {
            return {
                type: "call",
                func: { type: "var", value: cont },
                args: [body],
            };
        });

        // TODO: 为什么这里 return k
        return k({
            type: "lambda",
            name: exp.name,
            vars: [cont].concat(exp.vars),
            body,
        });
    }

    function cps_call(exp, k) {
        return cps(exp.func, function (func) {
            return (function loop(args, i) {
                if (i == exp.args.length)
                    return {
                        type: "call",
                        func: func,
                        args: args,
                    };
                return cps(exp.args[i], function (value) {
                    args[i + 1] = value;
                    return loop(args, i + 1);
                });
            })([make_continuation(k)], 0);
        });
    }

    function make_continuation(k) {
        var cont = gensym("R");
        // TODO: 为什么这里不 return k?
        return {
            type: "lambda",
            vars: [cont],
            // TODO: 非常重要
            body: k({ type: "var", value: cont }),
        };
    }

    function cps_let(exp, k) {
        if (exp.vars.length == 0) return cps(exp.body, k);
        return cps(
            {
                type: "call",
                args: [exp.vars[0].def || FALSE],
                func: {
                    type: "lambda",
                    vars: [exp.vars[0].name],
                    body: {
                        type: "let",
                        vars: exp.vars.slice(1),
                        body: exp.body,
                    },
                },
            },
            k
        );
    }
}

function test(code) {
    // get the AST
    var ast = parse(TokenStream(InputStream(code)));
    const cps = to_cps(ast, (r) => {
        return r;
    });
    const out = make_js(cps);

    return uglifyjs.parse(out).print_to_string({ beautify: true });
}

// TODO: 使用 identity作为k，同时使用return语句，所有的递归调用都要用return才能保证返回值
// k 内外反转，return
// return k(r) 中代表传入如的 r 会继续作为结果的一部分进行后续运算
// 外层函数调用的内层函数，return语句代表的函数结果可以不断累加，典型的类型是call
// 内层调用使用 k 代表继续进行转换运算，用内层对应的结果参与到外层运算中，例如 binary + call: foo(1) + bar(2)
// return r 中 r 代表整个的返回结果

// console.log(test('1; a = foo(10); 2;'))
// console.log(test('a = foo(10);'))
// console.log(test('a = foo(bar(10));'))
// console.log(test('a = foo(10) + bar(20);'))

// sequences
// console.log(
//     test(`
// foo();
// bar();
// baz();
// `)
// );
// console.log(
//     test(`
//     1 ; 2; 3
// `)
// );

// console.log(test("if 1 then 2 else 3;"));
// console.log(test('if foo() then a = 1 else b = 2;'))
// console.log(test('a = if foo() then 1 else 2;'))

// FIXME: code explosion exponentially
// console.log(test(`
// a = if foo() then 1 else 2;
// b = if bar() then 3 else 4;
// c = if baz() then 5 else 6;
// `))

// Functions
// console.log(test(`1; add = λ(a, b) a + b; 2`))
// TODO: tail call optimization dup tail calls add
// console.log(test(`dup = λ(x) add(x, x);`))

// Let
// TODO: let表达式是语法糖，翻译为嵌套的函数调用
// console.log(test(`
// let (a = foo(), b = bar(a)) {
//     print(a + b);
// }
// `))

// fib
// console.log(test(`
// fib = λ(n) {
//     if n < 2 then n
//     else
//       fib(n - 1) +
//       fib(n - 2);
//   };
//   print(fib(20));
// `))

// side effect
// dropping expression with no side effects 1 ; 3
// console.log(test("1; a = 2; 3"));

// console.log(
//     test(`
// a = if foo then 1 else 2;
// print(a);
// `)
// );

console.log(
    test(`
fib = λ(n) if n < 2 then n else fib(n - 1) + fib(n - 2);
    `)
);
