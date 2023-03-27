const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");

globalEnv.def("with-yield", function withYield(k1, f) {
    let pause;
    let resume;
    function yield(k3, value) {
        shift(k3, function (sk) {
            resume = sk;
            value;
        });

        // yield 中应该调用generator的k值，将yield参数作为generator调用的返回
        pause(value);
    }

    function generator(k2) {
        pause = k2;

        reset(k2, () => {
            if (resume) {
                resume();
            } else {
                f(k2, yield);
            }
        })
    }

    k1(generator);
});

var pstack = [];

function _goto(f) {
    f(function KGOTO(r) {
        console.log('KGOTO: ', r)
        var h = pstack.pop();
        h(r);
    });
}
function reset(KRESET, th) {
    pstack.push(KRESET);
    _goto(th);
}
// globalEnv.def("reset", reset);

function shift(KSHIFT, f) {
    _goto(function (KGOTO) {
        f(KGOTO, function SK(k1, v) {
            pstack.push(k1);
            KSHIFT(v);
        });
    });
}
// globalEnv.def("shift", shift);

// yield调用的k2是generator第一次被调用时k2,没有发生变化

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
