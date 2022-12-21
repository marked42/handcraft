#lang racket

; remove fist item in list
(define (rember item list)
    (cond ((null? list) '())
        ((eq? (car list) item) (cdr list))
        (else (cons (car list)
                (rember item
                    (cdr list))))))

(rember 'mint '(lamb chops and mint jelly))
(rember 'mint '(lamb chops and mint flavored mint jelly))
(rember 'toast '(bacon lettuce and tomato))
(rember 'cup '(coffee cup tea cup and hick cup))
