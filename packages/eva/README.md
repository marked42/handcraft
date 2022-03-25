# Eva

Eva is the mini language in course [Building an Interpreter from scratch](https://www.udemy.com/course/essentials-of-interpretation/), and this is a version implemented in typescript.

Install eva command line tool with following command.

```bash
npm i -g @handcraft/eva
```

You can use eva command to evaluate eva script from different sources.

Use `-e` argument to execute code directly.

```bash
eva -e '(var x 10) (print (* x 15))'
eva -e '(print ((lambda (x) (* x x)) 2))'
```

Use `-f` argument to execute local script file.

```bash
eva -f test/test.eva
eva -f test/math-test.eva
```

Otherwise you'll have a interactive shell like node.

```bash
eva

> (var x 10)
> (x)
10
```
