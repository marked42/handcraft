const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

globalEnv.def("halt", function (k) {});

// halt stops the program and bar is not printed
run(`
println("foo");
halt();
println("bar");
`);
