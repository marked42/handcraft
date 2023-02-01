function evaluate(exp, env, callback) {
    switch (exp.type) {
        case "num":
        case "str":
        case "bool":
            callback(exp.value);
            return;
        case "var":
            callback(env.get(exp.value));
            return;
        case "assign":
            if (exp.left.type !== "var") {
                throw new Error("Cannot assign to " + JSON.stringify(exp.left));
            }
            evaluate(exp.right, env, function (right) {
                callback(env.set(exp.left.value, right));
            });
            return;
        case "binary":
            evaluate(exp.left, env, function (left) {
                evaluate(exp.right, env, function (right) {
                    callback(apply_op(exp.operator, left, right));
                });
            });
            break;
        case "let":
            (function loop(env, i) {
                if (i < exp.vars.length) {
                    var v = exp.vars[i];
                    if (v.def) {
                        evaluate(v.def, env, function (value) {
                            var scope = env.extend();
                            scope.def(v.name, value);
                            loop(scope, i + 1);
                        });
                    } else {
                        var scope = env.extend();
                        scope.def(v.name, false);
                        loop(scope, i + 1);
                    }
                } else {
                    evaluate(exp.body, env, callback);
                }
            })(env, 0);
            return;
        case "lambda":
            callback(make_lambda(env, exp));
            return;
        case "if":
            evaluate(exp.cond, env, function (cond) {
                if (cond !== false) {
                    evaluate(exp.then, env, callback);
                } else if (exp.else) {
                    evaluate(exp.else, env, callback);
                } else {
                    callback(false);
                }
            });
            return;
        case "prog":
            (function loop(last, i) {
                if (i < exp.prog.length) {
                    evaluate(exp.prog[i], env, function (val) {
                        loop(val, i + 1);
                    });
                } else {
                    callback(last);
                }
            })(false, 0);
            break;
        case "call":
            evaluate(exp.func, env, function (func) {
                (function loop(args, i) {
                    if (i < exp.args.length) {
                        evaluate(exp.args[i], env, function (arg) {
                            args[i + 1] = arg;
                            loop(args, i + 1);
                        });
                    } else {
                        func.apply(null, args);
                    }
                })([callback], 0);
            });
            return;
        default:
            throw new Error("I don't know how to evaluate ", +exp.type);
    }
}

function apply_op(op, left, right) {
    const ops = {
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "*": (a, b) => a * b,
        "/": (a, b) => a / b,
    };

    return ops[op](left, right);
}

function make_lambda(env, exp) {
    if (exp.name) {
        env = env.extend();
        env.def(exp.name, lambda);
    }

    function lambda(callback) {
        var names = exp.vars;
        var scope = env.extend();
        for (var i = 0; i < names.length; i++) {
            scope.def(
                names[i],
                i + 1 < arguments.length ? arguments[i + 1] : false
            );
        }
        evaluate(exp.body, scope, callback);
    }

    return lambda;
}

foo = lambda(return, a, b, c) {
    println("foo");
    return("DONE");
    println("bar");
}
CallCC(foo);

function CallCC(k, f, ...rest) {
    f(k, function cc(discarded, val) {
        k(val)
    }, ...rest)
}

fail = λ() false;
guess = λ(current) {
  CallCC(λ(k){
    let (prevFail = fail) {
      fail = λ(){
        current = current + 1;
        if current > 100 {
          fail = prevFail;
          fail();
        } else {
          k(current);
        };
      };
      k(current);
    };
  });
};

a = guess(1);
b = guess(a);
if a * b == 84 {
  print(a); print(" x "); println(b);
};
fail();
