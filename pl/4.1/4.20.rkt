#lang sicp

(define (tagged-list? exp tag)
  (if (pair? exp)
      (eq? (car exp) tag)
      false))
(define (letrec? exp) (tagged-list? exp 'letrec))

(define (let-var-val-pairs exp) (cadr exp))
(define (let-vars exp) (map car (let-var-val-pairs exp)))
(define (let-vals exp) (map cadr (let-var-val-pairs exp)))
(define (let-body exp) (cddr exp))

; (let ((var1 '*unassigned*) (var2 '*unassigned*))
;     (begin
;         (set! var1 1)
;         (set! var2 1)
;     )
;     3
;     4
; )
(define letrec-exp '(letrec ((var1 1) (var2 2)) 3 4))

(define (letrect->let exp)
  (let ((vars (let-vars exp)) (pairs (let-var-val-pairs exp)) (body (let-body exp)))
    ; (list vars vals body)
    (append
     (list
      'let
      (map (lambda (var) (list var '*unassgined)) vars)
      (list 'begin (map (lambda (pair) (cons 'set! pair)) pairs))
      )
     body
     )
    )
  )

(letrect->let letrec-exp)
