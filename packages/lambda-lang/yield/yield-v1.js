const { run } = require("../cps-evaluator-trampoline");
const { globalEnv } = require("../env");

globalEnv.def("with-yield", function withYield(kWithYield, f) {
    function generator(kGenerator) {
        function yield(kYield, value) {
            // yield 中应该调用generator的k值，将yield参数作为generator调用的返回
            kGenerator(value);
        }

        f(kGenerator, yield);
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
