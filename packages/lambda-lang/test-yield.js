const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require('./env')

globalEnv.def("CallCC", function (k, f) {
    f(k, function CC(discarded, ret) {
        k(ret);
    });
});

// return 参数由call/cc注入，调用的效果相当于CallCC表达式的返回值是return的参数
run(`
foo = λ(return){
    println("foo");
    return("DONE");
    println("bar");
};

println("1");
println(CallCC(foo));
println("2");
println(CallCC(foo));
println("3");
`);
