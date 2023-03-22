const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

globalEnv.def("CallCC", function (k, f) {
    f(k, function CC(discarded, ret) {
        k(ret);
    });
});

// return
run(`
foo = λ(return){
    println("foo");
    return("DONE");
    println("bar");
  };
  CallCC(foo);
`);
