const { globalEnv } = require("./env");
const { run, trampoline, Continuation } = require('./cps-evaluator-trampoline')

globalEnv.def('sleep', function (k, ms) {
    setTimeout(() => {
        trampoline(new Continuation(k, [false]))
    }, ms)
})

run(`
let loop (n = 0) {
    if n < 10 {
      println(n);
      sleep(250);
      loop(n + 1);
    }
  };
  println("And we're done");
`)
