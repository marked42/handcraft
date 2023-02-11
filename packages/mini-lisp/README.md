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
    1. cond test => recipient form
    1. let/named let simultaneous binding
    1. let 语句的变量初始化表达式在对应匿名函数外层环境求值，作为参数传给匿名函数，因此 let 定义的变量对于初始化表达式不可见，无法形成递归形式。
    1. define 定义的变量不能互相引用，效果和 let 相同。
    1. let-rec 的变量初始值为 unassigned 特殊值，初始化的表达式在匿名函数内部求值，因此能引用定义的变量，形成递归形式。
1. primitive procedure
1. compound procedure with environment model

lazy evaluation + side effects + memoization

1. 用户自定义函数是 lazy，内置函数是 eager
1. 设计语法可以指定任意一个函数的参数是否 lazy 和 memo

[SICP Exercise Solutions](https://eli.thegreenplace.net/tag/sicp)

## Variable Binding

let 表达式的变量初始化表达式中引用的变量是外层变量，该 let 定义的变量

1. declaration / reference
1. binding association between a variable and its value
1. scope
1. extent time interval during which binding is maintained
    1. closure referenced binding semi-infinite extent / dynamic property
    1. dynamic extent / static property
1. dynamic / static
1. lexical scoping
1. scoping rules

Books

1. EOPL 3.5 Scoping and Binding of Variables
1. SICP 4.1.6 Internal Definitions
1. PLP 3 Names Scopes Bindings

## Applicative Order VS Normal Order

1. SICP 4.2 Variations on a Scheme
1. Programming language pragmatics 6.62 Applicative- and Normal-Order Evaluation
1. Lazy evaluation
1. call-by-name = lazy evaluation without memoization
1. call-by-need = lazy evaluation + memoization
1. thunk / force / the process of evaluating the expression in a thunk is called forcing.
    1. passed to a primitive procedure that will use the value of thunk
    1. used as predicate of a conditional
    1. used as procedure to be applied

## Streams

SICP 3.5

定义 stream 的两种方式

将 integer 当做完整的序列，利用序列的第 n 项，计算下一项 n + 1。

```scheme
integer 1 2 3 4 5 6
          1 2 3 4 5 6
          1 1 1 1 1 1
(define integers (cons-stream 1 (add-streams ones integers)))
```

这种方法定义 `integers`是表达式，需要语言支持惰性求实，否则递归调用死循环。

将 integer 当做接收 start 参数的函数，表示从 start 开始的自然数序列，可以递归定义。

```scheme
<!-- (cons start integer(start + 1)) -->

(define (integer start)
  (cons-stream start (integer (+ start 1)))
  )
```

其中通项同事 next = start + 1

## Concurrency

assignment / concurrency SICP 3.4

## Y Combinator/Fixed Point

1. SICP Exercise 4.21 Page 533
1. Design Concepts in programming languages Chapter 5 Fixed Points

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
