function has_side_effects(exp) {
    switch (exp.type) {
        case "assign":
        case "call":
            return true;

        case "bool":
        case "str":
        case "num":
        case "var":
        case "lambda":
            return false;

        case "binary":
            return has_side_effects(exp.left) || has_side_effects(exp.right);

        case "if":
            return (
                has_side_effects(exp.if) ||
                has_side_effects(exp.then) ||
                (!!exp.else && has_side_effects(exp.else))
            );

        case "let":
            return (
                exp.vars.some((v) => has_side_effects(v.def)) ||
                has_side_effects(exp.body)
            );

        case "prog":
            return exp.prog.some(has_side_effects);

        default:
            throw new Error("cannot handle this");
    }
}

module.exports.has_side_effects = has_side_effects;
