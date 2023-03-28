const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

// 死循环
globalEnv.def("with-yield", function withYield(k1, f) {
    let pause;
    let resume;
    function yield(kYield, value) {
        resume = kYield;

        // yield 中应该调用generator的k值，将yield参数作为generator调用的返回
        pause(value);
    }

    function generator(kGenerator) {
        pause = kGenerator;

        if (resume) {
            // FIXME: undelimited continuation造成死循环
            resume();
        } else {
            f(kGenerator, yield);
        }
    }

    k1(generator);
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
