#lang racket

(require racket/control)

; (display (* 2 (reset (+ 1 (shift k 5)))))

(reset
 (begin
   (shift k (cons 2 (k (void))))
   (shift k (cons 1 (k (void))))
   null
   ))

(define (yield x) (shift k (cons x (k void))))

(reset (begin
         (yield 1)
         (yield 2)
         (yield 3)
         null))

(define (stream-yield x) (shift k (stream-cons x (k (void)))))
