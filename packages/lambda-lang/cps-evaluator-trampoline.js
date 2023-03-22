const { InputStream, TokenStream, parse } = require("./parser");
const { globalEnv } = require("./env");

const STACK_LIMIT = 200;
let stackDepth = 0;
/**
 * 递归函数执行时避免stack overflow
 */
function GUARD_STACK(f, args) {
    // console.log('stackDepth: ', stackDepth, f.name)
    if (stackDepth++ > STACK_LIMIT) {
        throw new Continuation(f, args);
    }
}

function resetStack() {
    stackDepth = 0;
    // console.log('reset stack')
}

class Continuation {
    constructor(f, args) {
        this.f = f;
        this.args = args;
    }
}

module.exports.Continuation = Continuation;

function evaluate(exp, env, callback) {
    GUARD_STACK(evaluate, arguments);
    switch (exp.type) {
        case "num":
        case "str":
        case "bool":
            return callback(exp.value);

        case "var":
            return callback(env.get(exp.value));

        case "assign":
            if (exp.left.type != "var") {
                throw new Error("Cannot assign to " + JSON.stringify(exp.left));
            }
            evaluate(exp.right, env, function cc(result) {
                GUARD_STACK(cc, arguments);
                callback(env.set(exp.left.value, result));
            });
            return;

        case "binary":
            evaluate(exp.left, env, function cc(left) {
                GUARD_STACK(cc, arguments);
                evaluate(exp.right, env, function cc(right) {
                    GUARD_STACK(cc, arguments);
                    callback(apply_op(exp.operator, left, right));
                });
            });
            return;

        case "let":
            (function loop(env, i) {
                GUARD_STACK(loop, arguments);
                if (i < exp.vars.length) {
                    const { name, def } = exp.vars[i];
                    const newEnv = env.extend();
                    if (!def) {
                        newEnv.def(name, false);
                        loop(newEnv, i + 1);
                    } else {
                        evaluate(def, env, function cc(val) {
                            GUARD_STACK(cc, arguments);
                            newEnv.def(name, val);
                            loop(newEnv, i + 1);
                        });
                    }
                } else {
                    evaluate(exp.body, env, function cc(val) {
                        GUARD_STACK(cc, arguments);
                        callback(val);
                    });
                }
            })(env, 0);
            return;

        case "if":
            evaluate(exp.cond, env, function cc(cond) {
                GUARD_STACK(cc, arguments);
                if (cond !== false) {
                    evaluate(exp.then, env, function cc(consequent) {
                        GUARD_STACK(cc, arguments);
                        callback(consequent);
                    });
                } else if (exp.else) {
                    evaluate(exp.else, env, function cc(alternate) {
                        GUARD_STACK(cc, arguments);
                        callback(alternate);
                    });
                } else {
                    // 没有else分支，默认值是false
                    callback(false);
                }
            });
            return;

        case "prog":
            // 错误实现
            // var val = false;
            // exp.prog.forEach(function (exp) {
            //     evaluate(exp, env, (result) => {
            //         val = result;
            //     });
            // });
            (function loop(last, i) {
                GUARD_STACK(loop, arguments);
                if (i < exp.prog.length)
                    evaluate(exp.prog[i], env, function cc(val) {
                        GUARD_STACK(cc, arguments);
                        loop(val, i + 1);
                    });
                else {
                    callback(last);
                }
            })(false, 0);
            return;

        case "lambda":
            return callback(make_lambda(env, exp));

        case "call":
            evaluate(exp.func, env, function cc(func) {
                GUARD_STACK(cc, arguments);
                const args = [];
                // make_lambda 记录形参个数，才能在调用的时候校验参数个数和类型

                (function loop(callback, i) {
                    GUARD_STACK(loop, arguments);
                    if (i < exp.args.length) {
                        const def = exp.args[i];
                        if (!def) {
                            args[i] = false;
                            loop(callback, i + 1);
                        } else {
                            evaluate(def, env, function cc(val) {
                                GUARD_STACK(cc, arguments);
                                args[i] = val;
                                loop(callback, i + 1);
                            });
                        }
                    } else {
                        func.call(null, callback, ...args);
                    }
                    // call 表达式使用callback传递给 lambda
                })(callback, 0);
            });
            return;

        default:
            throw new Error("I don't know how to evaluate " + exp.type);
    }
}

function apply_op(op, a, b) {
    function num(x) {
        if (typeof x != "number")
            throw new Error("Expected number but got " + x);
        return x;
    }
    function div(x) {
        if (num(x) == 0) throw new Error("Divide by zero");
        return x;
    }
    switch (op) {
        case "+":
            return num(a) + num(b);
        case "-":
            return num(a) - num(b);
        case "*":
            return num(a) * num(b);
        case "/":
            return num(a) / div(b);
        case "%":
            return num(a) % div(b);
        case "&&":
            return a !== false && b;
        case "||":
            return a !== false ? a : b;
        case "<":
            return num(a) < num(b);
        case ">":
            return num(a) > num(b);
        case "<=":
            return num(a) <= num(b);
        case ">=":
            return num(a) >= num(b);
        case "==":
            return a === b;
        case "!=":
            return a !== b;
    }
    throw new Error("Can't apply operator " + op);
}

function make_lambda(env, exp) {
    if (exp.name) {
        env = env.extend();
        env.def(exp.name, lambda);
    }
    function lambda(callback, ...args) {
        GUARD_STACK(lambda, arguments);
        var names = exp.vars;
        var scope = env.extend();
        for (var i = 0; i < names.length; ++i) {
            scope.def(names[i], i < args.length ? args[i] : false);
        }
        return evaluate(exp.body, scope, callback);
    }
    return lambda;
}

function run(code) {
    var ast = parse(TokenStream(InputStream(code)));
    const continuation = new Continuation(evaluate, [
        ast,
        globalEnv,
        function end(val) {
            console.log("end:", val);
        },
    ]);

    return trampoline(continuation);
}

function trampoline(continuation) {
    while (true) {
        try {
            continuation.f.apply(null, continuation.args);
            // 执行到这里说明递归过程没有触发stackoverflow, 全部运行结束，应该返回了。j
            return;
        } catch (e) {
            if (e instanceof Continuation) {
                continuation = e;
                resetStack();
            }
        }
    }
}

module.exports.run = run;
module.exports.trampoline = trampoline;

// run(`1`)
