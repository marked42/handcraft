# 介绍

Eva 是课程[Building an Interpreter from scratch](https://www.bilibili.com/video/BV1XZ4y1k7T7)中 Eva 语言解释器的 Typescript 实现版本。

使用下面的命令安装 eva 命令行工具

```bash
npm i -g @handcraft/eva
```

有三种方式可以执行 eva 代码。

`-e`参数直接接受输入作为代码执行

```bash
eva -e '(var x 10) (print (* x 15))'
eva -e '(print ((lambda (x) (* x x)) 2))'
```

不使用任何参数进入交互执行模式。

```bash
eva

> (var x 10)
> (x)
10
```

`-f`参数读取本地 eva 脚本文件执行

```bash
eva -f test/test.eva
eva -f test/math-test.eva
```
