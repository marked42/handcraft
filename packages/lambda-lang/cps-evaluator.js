const { InputStream, TokenStream, parse } = require("./parser");
const { globalEnv } = require("./env");

function evaluate(exp, env, callback) {
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
            evaluate(exp.right, env, (result) => {
                callback(env.set(exp.left.value, result));
            });
            return;

        case "binary":
            evaluate(exp.left, env, (left) => {
                evaluate(exp.right, env, (right) => {
                    callback(apply_op(exp.operator, left, right));
                });
            });
            return;

        case "let":
            (function loop(env, i) {
                if (i < exp.vars.length) {
                    const { name, def } = exp.vars[i];
                    const newEnv = env.extend();
                    if (!def) {
                        newEnv.def(name, false);
                        loop(newEnv, i + 1);
                    } else {
                        evaluate(def, env, (val) => {
                            newEnv.def(name, val);
                            loop(newEnv, i + 1);
                        });
                    }
                } else {
                    evaluate(exp.body, env, (val) => {
                        callback(val);
                    });
                }
            })(env, 0);
            return;

        case "if":
            evaluate(exp.cond, env, (cond) => {
                if (cond !== false) {
                    evaluate(exp.then, env, (consequent) => {
                        callback(consequent);
                    });
                } else if (exp.else) {
                    evaluate(exp.else, env, (alternate) => {
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
                if (i < exp.prog.length)
                    evaluate(exp.prog[i], env, function (val) {
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
            evaluate(exp.func, env, (func) => {
                const args = [];
                // make_lambda 记录形参个数，才能在调用的时候校验参数个数和类型

                (function loop(callback, i) {
                    if (i < exp.args.length) {
                        const def = exp.args[i];
                        if (!def) {
                            args[i] = false;
                            loop(callback, i + 1);
                        } else {
                            evaluate(def, env, (val) => {
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
        var names = exp.vars;
        var scope = env.extend();
        for (var i = 0; i < names.length; ++i)
            scope.def(names[i], i < args.length ? args[i] : false);
        return evaluate(exp.body, scope, callback);
    }
    return lambda;
}

/* -----[ entry point for NodeJS ]----- */

function run(code) {
    var ast = parse(TokenStream(InputStream(code)));
    return evaluate(ast, globalEnv, (val) => {
        console.log("end: ", val);
    });
}

module.exports.run = run;

function test(code, value, msg) {
    var ast = parse(TokenStream(InputStream(code)));
    evaluate(ast, globalEnv, (result) => {
        if (value !== result) {
            console.error(`msg: ${msg}, ${value}, ${code}`);
        }
    });
}

// test("1", 1, "number");
// test('"a text"', "a text", "string");
// test("true", true, "boolean");
// test("1 + 1", 2, "binary");
// test("zero", 0, "var");
// test("a = 1", 1, "assign");
// test("if true then 2 else 3", 2, "if-then-else");
// test("if true then 2", 2, "if-then");
// test("if false then 2 else 3", 3, "if-then-else");
// test("if false then 2", false, "if-then");

// test("let (x = 2, y = 3, z = x + y) x + y + z;", 10, "let");

// test("a = lambda (x, y) x + y; a(1, 2)", 3, "lambda");

// var code = "sum = lambda(x, y) x + y; print(sum(2, 3));";
// 看 print中 exer 1
// var code = "print(1);print(2)";
// run(code);

// const code = `
// fib = λ(n) if n < 2 then n else fib(n - 1) + fib(n - 2);
// time( λ() println(fib(10)) );`;
// run(code);

// const code = `
// println(2 + twice(3, 4));
// println("Done");
// `;
// run(code);

// return
// run(`
// foo = λ(return){
//     println("foo");
//     return("DONE");
//     println("bar");
//   };
//   CallCC(foo);
// `);

// wrap callcc inside with-return
// run(`
// with-return = λ(f) λ() CallCC(f);

// foo = with-return(λ(return){
//   println("foo");
//   return("DONE");
//   println("bar");
// });

// foo();

// `);

// guess
// run(`
// fail = λ() false;
// guess = λ(current) {
//   CallCC(λ(k){
//     let (prevFail = fail) {
//       fail = λ(){
//         current = current + 1;
//         if current > 4 {
//           fail = prevFail;
//           fail();
//         } else {
//           k(current);
//         };
//       };
//       k(current);
//     };
//   });
// };

// a = guess(1);
// b = guess(a);
// print(a); print(" x "); println(b);
// fail();
// `);

// stack size limit
run(`
fib = λ(n) if n < 2 then n else fib(n - 1) + fib(n - 2);
time( λ() println(fib(11)) );
`);
