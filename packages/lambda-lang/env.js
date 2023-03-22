function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
}
Environment.prototype = {
    extend: function () {
        return new Environment(this);
    },
    lookup: function (name) {
        var scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name))
                return scope;
            scope = scope.parent;
        }
    },
    get: function (name) {
        if (name in this.vars) return this.vars[name];
        throw new Error("Undefined variable " + name);
    },
    set: function (name, value) {
        var scope = this.lookup(name);
        if (!scope && this.parent)
            throw new Error("Undefined variable " + name);
        return ((scope || this).vars[name] = value);
    },
    def: function (name, value) {
        return (this.vars[name] = value);
    },
};

var globalEnv = new Environment();

globalEnv.def("time", function (k, func) {
    console.time("time");
    func((ret) => {
        k(ret);
        console.timeEnd("time");
    });
});

globalEnv.def("println", function (k, val) {
    console.log(val);
    k(false);
});
globalEnv.def("print", function (k, val) {
    process.stdout.write(val.toString());
    // exer 1 如果这里不实现
    k(false);
});

globalEnv.def("twice", function (k, a, b) {
    k(a);
    k(b);
});

globalEnv.def("zero", 0);

module.exports = {
    Environment,
    globalEnv,
};
