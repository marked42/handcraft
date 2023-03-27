const { run } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");
var pstack = [];

function _goto(f) {
    f(function KGOTO(r) {
        var h = pstack.pop();
        h(r);
    });
}

globalEnv.def("reset", function (KRESET, th) {
    pstack.push(KRESET);
    _goto(th);
});

globalEnv.def("shift", function (KSHIFT, f) {
    _goto(function (KGOTO) {
        f(KGOTO, function SK(k1, v) {
            pstack.push(k1);
            KSHIFT(v);
        });
    });
});

run(`
with-yield = λ(func) {
    let (yield) {
      yield = λ(val) {
        shift(λ(SK){
          func = SK;
          val;         ## return val
        });
      };
      λ(val) {
        reset( λ() func(val || yield) );
      };
    }
  };

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
