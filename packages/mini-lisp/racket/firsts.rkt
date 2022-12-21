#lang racket

(define (firsts l)
    (cond ((null? l) '())
        (else (cons (car (car l))
            (firsts (cdr l))))))

(firsts (quote ((apple peach pumpkin)
    (plum pear cherry)
    (grape raisin pea)
    (bean carrot eggplant))))

(firsts (quote ((a b)
    (c d)
    (e f))))

(firsts (quote ()))

(firsts (quote ((five plums)
    (four)
    (eleven green oranges))))

(firsts (quote (((five plums) four)
    (eleven green oranges)
    ((no) more))))
