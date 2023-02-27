#lang eopl

(provide (all-defined-out))

(define (empty-store) '())

(define the-store 'uninitialized)

(define (get-store) the-store)

(define (initialize-store!)
  (set! the-store (empty-store))
  )

(define (reference? v) (integer? v))

(define (newref val)
  (let ((next-ref (length the-store)))
    (set! the-store (append the-store (list val)))
    next-ref
    )
  )

(define (deref ref)
  (list-ref the-store ref)
  )

(define (setref! ref val)
  (set! the-store
        (letrec
            ((setref-inner
              (lambda (store1 ref1)
                (cond
                  ((null? store1)
                   (report-invalid-reference ref the-store)
                   )
                  ((zero? ref1)
                   (cons val (cdr store1))
                   )
                  (else (cons (car store1) (setref-inner (cdr store1) (- ref1 1))))
                  )
                )))
          (setref-inner the-store ref)
          )
        )
  )

(define (report-invalid-reference ref the-store)
  (eopl:error 'setref! "invalid reference ~s" ref)
  )
