# Mini Lisp

1. [Reference](https://maryrosecook.com/blog/post/little-lisp-interpreter)
1. [(How to Write a (Lisp) Interpreter (in Python))](http://norvig.com/lispy.html)
1. [(An ((Even Better) Lisp) Interpreter (in Python))](http://norvig.com/lispy2.html)

## Roadmap

1. [LISP 方言路线图](https://www.zhihu.com/question/26760072/answer/35156245)
1. proper tail recursive
1. macro expansion
1. procedure with arbitrary number of arguments
1. primitive expression Atom / Symbol
1. means of combination List / Procedure
    1. special forms
    1. built-in
    1. user defined
1. means of abstraction name and Environment
1. Substitution Model Applicative Order/Normal Order
1. Conditional cond/else if/else and/or/not
1. [continuation passing style](https://lisperator.net/pltut/cps-evaluator/)
    1. [cps evaluator](https://lisperator.net/pltut/cps-evaluator/)
    1. [cps transformer](https://lisperator.net/pltut/compiler/cps-transformer)
    1. https://okmij.org/ftp/continuations/against-callcc.html
1. call with current continuation
1. lazy evaluation
1. register machine
1. [An Incremental Approach to Compiler Construction](http://scheme2006.cs.uchicago.edu/11-ghuloum.pdf)
1. [Lisp from Scratch in Rust](https://www.youtube.com/watch?v=0-wrD7gQ9R4)

### pair & list

1. https://docs.racket-lang.org/guide/Lists__Iteration__and_Recursion.html
1. https://docs.racket-lang.org/guide/Pairs__Lists__and_Racket_Syntax.html
1. https://people.csail.mit.edu/jaffer/r5rs/Pairs-and-lists.html

substitution model -> environment model -> evaluator (applicative order) -> normal order (lazy evaluation) -> non-deterministic computing -> logic programming -> register machine

lexical-addressing Section 5.5.6

注意被实现语言中的值如何在实现语言中表示，对于 metacircular 语言来说，也是不同的。

recursive procedure iterative process / recursive process

metacircular / self-hoisting

derived-expression/syntactic sugar 通过将语法转换另一种语法的等价形式来实现

变量定义策略

1. 当做是函数体执行时一个一个顺序定义，某些未定义直接使用的程序会报错。
1. 当做所有变量提前定义完成

optimize 区分 analyze 阶段和 execution 阶段，避免重复进行 analyze， 提高 evaluator 运行效率，

### evaluator

1. primitive data
    1. number/boolean/string
1. special forms
    1. quote
    1. assignment
    1. if
    1. lambda
    1. begin
    1. case
1. primitive procedure
1. compound procedure with environment model

## Streams

SICP 3.5

## Concurrency

assignment / concurrency SICP 3.4

## Constraint based language

SICP 3.3.5 Propagation of Constraints

## SICP in racket

1. https://docs.racket-lang.org/sicp-manual/index.html
1. https://stackoverflow.com/questions/19546115/which-lang-packet-is-proper-for-sicp-in-dr-racket

## Known Issues

TODO:

1. jest watch keeps file cache when creating new files
1. typescript type predicate on multiple args ?

```ts
function isNumbers(...args: any[]): args is number[] {
    // ...
}
```

### REPL

1. 一行一条语句
1. 一条语句跨多行
1. 一行多条语句
1. 错误处理
1. syntax error
