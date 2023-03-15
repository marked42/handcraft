#lang eopl

(require rackunit)

(define n 'uninitialized)
(define cont 'uninitialized)
(define val 'uninitialized)

(define (fact arg-n)
    (set! n arg-n)
    (set! cont (end-cont))
    (fact/k)
)

(define (fact/k)
    (if (zero? n)
        (begin
            (set! val 1)
            (apply-cont)
        )
        (begin
            ; 先更新cont，因为cont依赖于n
            (set! cont (fact-cont n cont))
            (set! n (- n 1))
            (fact/k)
        )
    )
)

(define-datatype continuation continuation?
    (end-cont)
    (fact-cont
        (n integer?)
        (cont continuation?)
    )
)

(define (apply-cont)
    (cases continuation cont
        ; 最后的通过end-cont 返回结果 val
        (end-cont () val)
        (fact-cont (saved-n saved-cont)
            (set! cont saved-cont)
            (set! val (* saved-n val))
            (apply-cont)
        )
    )
)

(check-equal? (fact 0) 1 "fact 0 is 1")
(check-equal? (fact 1) 1 "fact 1 is 1")
(check-equal? (fact 2) 2 "fact 2 is 2")
(check-equal? (fact 3) 6 "fact 3 is 6")
(check-equal? (fact 4) 24 "fact 4 is 24")
(check-equal? (fact 5) 120 "fact 5 is 120")
