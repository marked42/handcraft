#lang sicp

(define (f x)
  (define (even? n) (if (= n 0) true (odd? (- n 1))))
  (define (odd? n) (if (= n 0) false (even? (- n 1))))
  (display (even? x))
  (display (odd? x))
  )

(f 1)
(f 2)
