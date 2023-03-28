const { run } = require("../cps-evaluator-trampoline");
const { globalEnv } = require("../env");

globalEnv.def("with-yield", function withYield(kWithYield, f) {
    let resume;

    function generator(kGenerator) {
        function yield(kYield, value) {
            resume = kYield;

            // FIXME: kGenerator 没有变化，应该每次都使用不同的kGenerator
            kGenerator(value);
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
