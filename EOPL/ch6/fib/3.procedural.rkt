#lang eopl

(require rackunit)

(define (fib n)
    (fib/k n (end-cont))
)

(define (fib/k n cont)
    (if (< n 2)
        (apply-cont cont 1)
        (fib/k (- n 1) (fib1-cont n cont))
    )
)

(define (end-cont) (lambda (val) val))

(define (fib1-cont n cont)
    (lambda (val1)
        (fib/k (- n 2) (fib2-cont val1 cont))
    )
)

(define (fib2-cont val1 cont)
    (lambda (val2) (apply-cont cont (+ val1 val2)))
)

(define (apply-cont cont val)
    (cont val)
)

(check-equal? (fib 0) 1 "fib 0 is 1")
(check-equal? (fib 1) 1 "fib 1 is 1")
(check-equal? (fib 2) 2 "fib 2 is 2")
(check-equal? (fib 3) 3 "fib 3 is 3")
(check-equal? (fib 4) 5 "fib 4 is 5")
(check-equal? (fib 5) 8 "fib 5 is 8")
