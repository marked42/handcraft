const { TokenStream, InputStream, parse } = require("./parser");
// const { format } = require("prettier");

function make_js(exp) {
    return js(exp);

    function js(exp) {
        switch (exp.type) {
            case "num":
            case "str":
            case "bool":
                return js_atom(exp);
            case "var":
                return js_var(exp);
            case "binary":
                return js_binary(exp);
            case "assign":
                return js_assign(exp);
            case "prog":
                return js_prog(exp);
            case "if":
                return js_if(exp);
            case "let":
                return js_let(exp);
            case "lambda":
                return js_lambda(exp);
            case "call":
                return js_call(exp);
            default:
                throw new Error(
                    "Dont known how to make_js for " + JSON.stringify(exp)
                );
        }
    }

    function js_atom(exp) {
        return JSON.stringify(exp.value);
    }

    function js_prog(exp) {
        return `(${exp.prog.map(js).join(", ")})`;
    }

    function make_var(name) {
        return name;
    }

    function js_var(exp) {
        return make_var(exp.value);
    }

    function js_binary(exp) {
        return `(${[js(exp.left), exp.operator, js(exp.right)].join("")})`;
    }

    function js_assign(exp) {
        return js_binary(exp);
    }

    function js_lambda(exp) {
        let code = "(function ";
        if (exp.name) {
            code += make_var(exp.name);
        }
        code += "(" + exp.vars.map(make_var).join(", ") + ") {";
        code += "return " + js(exp.body) + "})";
        return code;
    }

    function js_if(exp) {
        return (
            "(" +
            js(exp.cond) +
            " !== false" +
            " ? " +
            js(exp.then) +
            " : " +
            js(exp.else || "false") +
            ")"
        );
    }

    // 将let翻译成嵌套的函数调用形式，参数作用域
    function js_let(exp) {
        if (exp.vars.length === 0) {
            return js(exp.body);
        }

        const iife = {
            type: "call",
            func: {
                type: "lambda",
                vars: [exp.vars[0].name],
                body: {
                    type: "let",
                    vars: exp.vars.slice(1),
                    body: exp.body,
                },
            },
            args: [exp.vars[0].def || "false"],
        };

        return "(" + js(iife) + ")";
    }

    function js_call(exp) {
        return js(exp.func) + "(" + exp.args.map(js).join(", ") + ")";
    }
}

function test(title, code, expected) {
    // get the AST
    var ast = parse(TokenStream(InputStream(code)));

    // get JS code
    // const genCode = format(make_js(ast), { parser: 'babel' });
    const genCode = make_js(ast);
    if (genCode !== expected) {
        console.error(title, code, expected);
    }
}

// test("sum = lambda(x, y) x + y; print(sum(2, 3));", '')
test("num", "1", "(1)");
test("bool", "true", "(true)");
test("str", '"true"', '("true")');
test("var", "a", "(a)");
test("binary", "1+a", "((1+a))");
// a=1会被解析为变量，不要删除空格
test("assign", "a = 1", "((a=1))");

test(
    "lambda",
    "sum = lambda(x, y) x + y;",
    "((sum=(function (x, y) {return (x+y)})))"
);

test("if", "if 0 then 1 else 2", "((0 !== false ? 1 : 2))");

// test("let", "let (a = 1, b = 2) { print(a + b); }", "not");

module.exports.make_js = make_js;
