const { run } = require("../cps-evaluator-trampoline");
const { globalEnv } = require("../env");

globalEnv.def("with-yield", function withYield(kWithYield, f) {
    let resume;
    let pause;

    function generator(kGenerator) {
        // 每次执行pause发生变化
        pause = kGenerator;

        // FIXME: yield 内部使用resume/pause，可以将整个函数挪到generator之外，不需要闭包。
        function yield(kYield, value) {
            resume = kYield;

            pause(value);
        }

        if (resume) {
            resume();
        } else {
            f(kGenerator, yield);
        }
    }

    kWithYield(generator);
});

run(`
# k1
foo = with-yield(λ name (yield){
    yield(1);
    "DONE";
  });

  println("line 1");
  println(foo());  # prints 1

  println("line 2");
  println(foo());  # prints DONE

  println("line 3"); # prints ?
  println(foo());  #
`);
