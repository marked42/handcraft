const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

// return
run(`
foo = λ(return){
    println("foo");
    return("DONE");
    println("bar");
  };
  CallCC(foo);
`);
