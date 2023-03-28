const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");
var pstack = [];

function _goto(f) {
    f(function KGOTO(r) {
        var h = pstack.pop();
        h(r);
    });
}

function reset(KRESET, th) {
    pstack.push(KRESET);
    _goto(th);
}
globalEnv.def("reset", reset);

function shift(KSHIFT, f) {
    _goto(function (KGOTO) {
        f(KGOTO, function SK(k1, v) {
            // re-installs interception
            pstack.push(k1);
            KSHIFT(v);
        });
    });
}
globalEnv.def("shift", shift);

globalEnv.def("with-yield", function (kWithYield, func) {
    const yield = (kYield, val) => {
        shift(kYield, (kShift, sk) => {
            func = sk;
            kShift(val);
        });
    };

    kWithYield(function generator(kGenerator) {
        reset(kGenerator, (KGOTO) => {
            func(KGOTO, yield);
        });
    });
});

run(`
# k1
foo = with-yield(λ name (yield){
    yield(1);
    yield(2);
    "DONE";
  });

  println("line 1");
  println(foo());  # prints 1

  println("line 2");
  println(foo());  # prints DONE

  println("line 3"); # prints ?
  println(foo());  #
`);
