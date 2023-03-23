const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

globalEnv.def("with-yield", function withYield(k1, f) {
    let yieldConts = [];
    // let cont
    function generator(k2) {
        // let cont
        function yield(k3, value) {
            yieldConts.push(k3);

            // yield 中应该调用generator的k值，将yield参数作为generator调用的返回
            k2(value);
        }

        console.log("length: ", yieldConts.length);
        if (yieldConts.length === 0) {
            f(k2, yield);
        } else {
            yieldConts[yieldConts.length - 1](false);
        }
    }

    k1(generator);
});

// yield调用的k2是generator第一次被调用时k2,没有发生变化

run(`
# k1
foo = with-yield(λ name (yield){
    # k3
    yield(1);
    # k3
    yield(2);
    # k3
    yield(3);
    "DONE";
  });

  println("line 1");
  # k2
  println(foo());  # prints 1
  println("line 2");
  # k2
  println(foo());  # prints 2
  println("line 3");
`);

// line1

// foo / generator  k2
//     lambda
//         yield 1  k3

// line 2

// foo / generator  k2
//     lambda
//         yield 2  k3
