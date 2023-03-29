const { TokenStream, InputStream, parse } = require("./parser");
const { make_js } = require("./code-gen");
const uglifyjs = require("uglify-js");

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

    function cps_prog(exp, k) {
        return (function loop(body) {
            if (body.length == 0) return k(FALSE);
            if (body.length == 1) return cps(body[0], k);
            return cps(body[0], function (first) {
                // FIXME: 生成了嵌套prog
                const val = loop(body.slice(1));
                return {
                    type: "prog",
                    prog: [first, val],
                };
            });
        })(exp.prog);
    }

    function cps_binary(exp, k) {
        return cps(exp.left, (left) => {
            return cps(exp.right, (right) => {
                return k({
                    type: exp.type,
                    operator: exp.operator,
                    left,
                    right,
                });
            });
        });
    }

    function cps_if(exp, k) {
        return cps(exp.cond, function (cond) {
            // TODO: why wrong ?
            // return cps(exp.cond, function(cond){
            //     return {
            //         type: "if",
            //         cond: cond,
            //         then: cps(exp.then, k),
            //         else: cps(exp.else || FALSE, k),
            //     };
            // });
            return cps(exp.then, (then) => {
                if (exp.else) {
                    return cps(exp.else, (alternate) => {
                        return k({
                            type: "if",
                            cond,
                            then,
                            else: alternate,
                        });
                    });
                }
                return k({
                    type: "if",
                    cond,
                    then,
                    else: false,
                });
            });
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

// console.log(test("1;2;3"));
// console.log(test("1;b + 3;c = 4;"));
// console.log(test("1; if b then a = 1 else a = 2; 4"));
// console.log(test("lambda (x) x + 1;"));
/**
 * TODO: 这个转换很重要
 * foo(function(β_R1) {
 *   return a = β_R1;
 * }, 10);
 */
console.log(test("1; a = foo(10); 2"));

// TODO: 使用 identity作为k，同时使用return语句
// TODO: 不使用CPS的方式实现转换？
// TODO: let表达式是语法糖，可以翻译成 call/lambda
