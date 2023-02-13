#lang racket/base

(require rackunit "ch1.rkt")
(check-equal? (in-S? 0) #t "0 in S")

(check-equal? (number-elements '(v0 v1 v2)) '((0 v0) (1 v1) (2 v2)) "number list elements")

; '#(2 2 2)
(check-eq? (vector-sum (make-vector 3 2)) 6 "list length should be 6")

; exer 1.15
(check-equal? (duple 2 3) '(3 3) "should return (1 1 1)")
(check-equal? (duple 4 '(ha ha)) '((ha ha) (ha ha) (ha ha) (ha ha)) "should return ((ha ha) (ha ha) (ha ha) (ha ha))")
(check-equal? (duple 0 '(blah)) '() "should return empty list")

; exer 1.16
(check-equal? (invert '((a 1) (a 2) (1 b) (2 b))) '((1 a) (2 a) (b 1) (b 2)) "should invert elements")

; exer 1.17
(check-equal? (down '(1 2 3)) '((1) (2) (3)) "should wrap top element with parenthesis")
(check-equal? (down '((a) (fine) (idea))) '(((a)) ((fine)) ((idea))) "should wrap top element with parenthesis")
(check-equal? (down '(a (more (complicated)) object)) '((a) ((more (complicated))) (object)) "should wrap top element with parenthesis")

; exer 1.18
(check-equal? (swapper 'a 'd '(a b c d)) '(d b c a) "swap a and d")
(check-equal? (swapper 'a 'd '(a d () c d)) '(d a () c a) "swap a and d")
(check-equal? (swapper 'x 'y '((x) y (z (x)))) '((y) x (z (y))) "swap x and y deeply")

; exer 1.19
(check-equal? (list-set '(a b c d) 2 '(1 2)) '(a b (1 2) d) "set 2nd element to (1 2)")
(check-equal? (list-ref (list-set '(a b c d) 3 '(1 5 10)) 3) '(1 5 10) "set 3rd element to (1 5 10)")

; exer 1.20
(check-equal? (count-occurrences 'x '((f x) y (((x z) x)))) 3 "count x")
(check-equal? (count-occurrences 'x '((f x) y (((x z) () x)))) 3 "count x")
(check-equal? (count-occurrences 'w '((f x) y (((x z) () x)))) 0 "count w")

; exer 1.21
(check-equal? (product '(a b c) '(x y)) '((a x) (a y) (b x) (b y) (c x) (c y)) "cartesian product")

; exer 1.22
(check-equal? (filter-in symbol? '(a 2 (1 3) b 7)) (2 7) "filter numbers")
