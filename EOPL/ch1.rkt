#lang racket/base

(define in-S?
    (lambda (n)
        (if (zero? n)
            #t
            (if (>= (- n 3) 0)
                (in-S? (- n 3))
                #f))))

(define (list-of-integer? l)
    (if (null? l)
        #t
        (if (pair? l)
            (and (number? (car l)) (list-of-integer? (cdr l)))
            #f
        )
    )
)

(define (list-length l)
    (cond ((null? l) 0)
          ((pair? l) (+ 1 (list-length (cdr l))))
          (else (error "l must be list"))
    )
)

(define (nth-element l n)
    (if (null? l)
        (error "nth-element list too short by ~s elements.~%" (+ n 1))
        (if (zero? n)
            (car l)
            (nth-element (cdr l) (- n 1))
        )
    )
)

; exer 1.6
; car 直接使用在空lis上报错

; exer 1.7
(define (nth-element l n)
    (define (loop list index)
        (if (null? list)
            ; FIXME:
            (eopl:error "list ~s does not have ~s elements.~%" l n)
            (if (zero? index)
                (car list)
                (nth-element (cdr list) (- index 1))
            )
        )
    )
    (loop l n)
)

(define (remove-first s los)
    (if (null? los)
        '()
        (let ((first (car los)) (rest (cdr los)))
            (if (eq? first s)
                rest
                (cons first (remove-first s rest))
            )
        )
    )
)

; exer 1.8
; 得到出现第一个符号s右边的子序列

; exer 1.9 remove all occurrences
(define (remove s los)
    (if (null? los)
        '()
        (let ((first (car los)) (rest (cdr los)))
            (if (eq? first s)
                (remove s rest)
                (cons first (remove s rest))
            )
        )
    )
)

; exer 1.10

(define (occurs-free var exp)
    (cond ((symbol? exp) (eqv? var exp))
          ((eqv? (car exp) 'lambda)
           (and
            (not (eqv? var (caadr exp)))
            (occurs-free? var (caddr exp))))
          (else
            (occurs-free? var (car exp))
            (occurs-free? var (cadr exp)))))

; S-list ::=({S-exp}∗)
; S-exp::=Symbol | S-list
; mutually recursive structure following grammar patterns
(define (subst old new slist)
    (if (null? slist)
        '()
        (let ((first (car slist) (rest (car slist))))
            (cons
                (subst-in-s-exp old new first)
                (subst old new rest)
            )
        )
    )
)

(define (subst-in-s-exp old new exp)
    (if (symbol? exp)
        (if (eqv? exp old) new exp)
        (subst old new exp)
    )
)

; exer 1.11 subst-in-exp递归调用subst，subst会减小问题规模

; exer 1.12 inline subst-in-s-exp
(define (subst-inline old new slist)
    (if (null? slist)
        '()
        (let ((first (car slist) (rest (car slist))))
            (cons
                (if (symbol? first)
                    (if (eqv? first old) new first)
                    (subst old new first)
                )
                (subst old new rest)
            )
        )
    )
)

; exer 1.13 使用map进行递归
(define (subst-map old new slist)
    (map
        (lambda (x)
            (if (symbol? x)
                (if (eqv? x old) new x)
                (subst-map x)
            )
        )
        slist))

; (v0 v1 v2 ...) -> ((0 v0) (1 v1) (2 v2) ...)
(define (number-elements-from l from)
    (if (null? l)
        '()
        (cons
            (list from (car l))
            (number-elements-from (cdr list) (+ n 1))
        )
    )
)

(define (number-elements l)
    (number-elements-from l 0)
)
