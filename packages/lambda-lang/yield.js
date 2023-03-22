const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

// globalEnv.def("with-yield", function withYield(k1, f) {
//     function generator(k2) {
//         let cont;
//         function yield(k3, value) {
//             console.log("yield: ", k3, value);
//             cont = k3;

//             // yield 中应该调用generator的k值，将yield参数作为generator调用的返回
//             k2(value);
//         }

//         console.log("cont: ", cont);
//         if (!cont) {
//             f(k2, yield);
//         } else {
//             cont(false);
//         }
//     }

//     k1(generator);
// });

globalEnv.def("with-yield", function withYield(k1, f) {
    let count = 0;
    function generator(k2) {
        function yield(k3, value) {
            console.log("yield: ", k3, value);
            count++;
            f = k3;

            // yield 中应该调用generator的k值，将yield参数作为generator调用的返回
            k2(value);
        }

        console.log("f: ", f);

        console.log("count: ", count);
        if (!count) {
            f(k2, yield);
        } else {
            f(() => k2(false));
        }
    }

    k1(generator);
});

run(`
foo = with-yield(λ name (yield){
    yield(1);
    yield(2);
    "DONE";
  });

  println("line 1");
  println(foo());  # prints 1
  println("line 2");
  println(foo());  # prints 2
  println("line 3");
  println(foo());  # prints DONE
  println("line 4");
`);
