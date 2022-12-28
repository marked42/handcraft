# Mini Lisp

1. [Reference](https://maryrosecook.com/blog/post/little-lisp-interpreter)
1. [(How to Write a (Lisp) Interpreter (in Python))](http://norvig.com/lispy.html)
1. [(An ((Even Better) Lisp) Interpreter (in Python))](http://norvig.com/lispy2.html)

## Roadmap

1. [LISP 方言路线图](https://www.zhihu.com/question/26760072/answer/35156245)
1. proper tail recursive
1. macro expansion
1. call with continuation

1. primitive expression Atom / Symbol
1. means of combination List / Procedure
    1. special forms
    1. built-in
    1. user defined
1. means of abstraction name and Environment
1. Substitution Model Applicative Order/Normal Order
1. Conditional cond/else if/else and/or/not
1. [continuation passing style](https://lisperator.net/pltut/cps-evaluator/) call-cc
1. [An Incremental Approach to Compiler Construction](http://scheme2006.cs.uchicago.edu/11-ghuloum.pdf)

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
