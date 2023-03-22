const { run } = require("./cps-evaluator-trampoline");

// return 参数由call/cc注入，调用的效果相当于CallCC表达式的返回值是return的参数
run(`
foo = λ(return){
    println("foo");
    return("DONE");
    println("bar");
};

CallCC(foo);
`);

// with-return接受一个函数f，生成一个函数foo，
// foo调用时，不接受任何参数，效果相当于用CallCC调用原来的函数
// return("DONE")调用时，相当于CallCC(f)的返回值是 "DONE"
// 而foo()的返回值就是其中最后一句，也是唯一一句CallCC(f)的值 "DONE"
run(`
with-return = λ(f) λ() CallCC(f);

foo = with-return(λ(return){
  println("foo");
  return("DONE");
  println("bar");
});

foo();
`);
