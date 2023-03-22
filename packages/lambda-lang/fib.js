const { run } = require('./cps-evaluator-trampoline')

// 743 ms vs cps 8 ms
// 一百倍 两个数量级的差异
run(`
fib = λ(n) if n < 2 then n else fib(n - 1) + fib(n - 2);
time( λ() println(fib(11)) );
`)
