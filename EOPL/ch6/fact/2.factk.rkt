#lang eopl

(require rackunit)

(define (fact n)
    (fact/k n (end-cont))
)

(define (fact/k n cont)
    (if (zero? n)
        (apply-cont cont 1)
        (fact/k (- n 1) (fact-cont n cont))
    )
)

(define-datatype continuation continuation?
    (end-cont)
    (fact-cont
        (n integer?)
        (cont continuation?)
    )
)

(define (apply-cont cont val)
    (cases continuation cont
        (end-cont () val)
        (fact-cont (saved-n saved-cont)
            (apply-cont saved-cont (* saved-n val))
        )
    )
)

(check-equal? (fact 0) 1 "fact 0 is 1")
(check-equal? (fact 1) 1 "fact 1 is 1")
(check-equal? (fact 2) 2 "fact 2 is 2")
(check-equal? (fact 3) 6 "fact 3 is 6")
(check-equal? (fact 4) 24 "fact 4 is 24")
(check-equal? (fact 5) 120 "fact 5 is 120")
