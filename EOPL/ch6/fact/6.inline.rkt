#lang eopl

(require rackunit)

(define (fact n)
    (fact/k n (lambda (val) val))
)

(define (fact/k n cont)
    (if (zero? n)
        (cont 1)
        (fact/k (- n 1) (lambda (val) (cont (* val n))))
    )
)

(check-equal? (fact 0) 1 "fact 0 is 1")
(check-equal? (fact 1) 1 "fact 1 is 1")
(check-equal? (fact 2) 2 "fact 2 is 2")
(check-equal? (fact 3) 6 "fact 3 is 6")
(check-equal? (fact 4) 24 "fact 4 is 24")
(check-equal? (fact 5) 120 "fact 5 is 120")
