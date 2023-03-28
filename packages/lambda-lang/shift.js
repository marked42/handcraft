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
println(reset(lambda () {
    1 + shift(lambda (k) k(k(2)));
}))
`);
