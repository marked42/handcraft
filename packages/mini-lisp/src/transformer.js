function to_cps(exp, k) {
    return cps(exp, k);

    function cps(exp, k) {
        switch (exp.type) {
            case "num":
            case "str":
            case "bool":
            case "var":
                return cps_atom(exp, k);

            case "assign":
            case "binary":
                return cps_binary(exp, k);

            //   case "let"    : return cps_let    (exp, k);
            //   case "lambda" : return cps_lambda (exp, k);
            //   case "if"     : return cps_if     (exp, k);
            //   case "prog"   : return cps_prog   (exp, k);
            //   case "call"   : return cps_call   (exp, k);

            default:
                throw new Error("Dunno how to CPS " + JSON.stringify(exp));
        }
    }

    function cps_atom(exp, k) {
        return k(exp);
    }

    function cps_binary(exp, k) {
        return cps(exp.left, function (left) {
            return cps(exp.right, function (right) {
                return k({
                    type: exp.type,
                    operator: exp.operator,
                    left: left,
                    right: right,
                });
            });
        });
    }
    // NOTE, the functions defined below must be placed here.
}

// a = 10
var ast = {
    type: "assign",
    operator: "=",
    left: {
        type: "var",
        name: "a",
    },
    right: {
        type: "num",
        value: 10,
    },
};

var cps = to_cps(ast, function (x) {
    return x;
});

console.log("cps: ", cps);
