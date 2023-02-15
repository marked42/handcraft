#lang racket

(require rackunit "ch2.rkt")

(check-equal? (is-zero? (zero)) #t "should return true")
(check-equal? (successor (zero)) (list 1) "successor")
(check-equal? (successor (list 15)) (list 0 1) "successor with carry")

(check-equal? (predecessor '(1)) (zero) "predecessor of 1 is 0")
