#lang eopl

(require rackunit)

(define (fib n)
    (if (< n 2)
        1
        (+
            (fib (- n 1))
            (fib (- n 2))
        )
    )
)

(check-equal? (fib 0) 1 "fib 0 is 1")
(check-equal? (fib 1) 1 "fib 1 is 1")
(check-equal? (fib 2) 2 "fib 2 is 2")
(check-equal? (fib 3) 3 "fib 3 is 3")
(check-equal? (fib 4) 5 "fib 4 is 5")
(check-equal? (fib 5) 8 "fib 5 is 8")
