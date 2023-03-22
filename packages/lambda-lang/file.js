const { run, trampoline, Continuation } = require("./cps-evaluator-trampoline");
const { globalEnv } = require("./env");
const fs = require("fs");
const path = require("path");

globalEnv.def("readFile", function (k, filename) {
    const filePath = path.join(__dirname, filename);
    fs.readFile(filePath, function (err, data) {
        console.log("read error: ", err);
        trampoline(new Continuation(k, [data]));
    });
});

globalEnv.def("writeFile", function (k, filename, data) {
    const filePath = path.join(__dirname, filename);
    fs.writeFile(filePath, data, function (err) {
        trampoline(new Continuation(k, [false]));
    });
});

run(`
copyFile = lambda (source, dest) {
    writeFile(dest, readFile(source));
};
copyFile("file-foo.txt", "file-bar.txt");
`);
