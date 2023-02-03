#lang racket

(define (eval exp env)
  (cond
    ((self-evaluating? exp) exp)
    ((quoted? exp) (text-of-quotation exp))
    ((variable? exp) (lookup-variable-value exp env))
    ; ((assignment? exp) (eval-assignment exp env))
    ; ((definition? exp) (eval-definition exp env))
    ; ((if? exp) (eval-if exp env))
    ; ((lambda? exp) (make-procedure (lambda-parameters exp)
    ;                                (lambda-body exp)
    ;                                env))
    ; ((begin? exp) (eval-sequence (begin-actions exp) env))
    ; ((cond? exp) (eval (cond->if exp) env))
    ; ((application? exp)
    ;  (apply (eval (operator exp) env)
    ;         (list-of-values (operands exp) env)))
    (else (error "Unkown expression type: EVAL" exp))))

(define (self-evaluating? exp)
  (cond ((number? exp) true)
        ((string? exp) true)
        (else false)))

(define (quoted? exp) (tagged-list? exp 'quote))

;FIXME: code on SCIP uses cadr, seems wrong
(define (text-of-quotation exp) (cdr exp))

(define (tagged-list? exp tag)
  (if (pair? exp)
      (eq? (car exp) tag)
      false))

(define (variable? exp) (symbol? exp))

; Environment
;TODO:
(define (lookup-variable-value var env)
  (cond
    ((eq? var 'a) 1)
    (else 2)
    )
  )

(define (enclosing-environment env) (cdr env))
(define (first-frame env) (car env))
(define the-empty-environment '())

(define (make-frame variables values) (cons variables values))
(define (frame-variables frame) (car frame))
(define (frame-values frame) (cdr frame))
(define (add-binding-to-frame! var val frame)
  (set-car! frame (cons var (car frame)))
  (set-cdr! frame (cons val (cdr frame)))
  )

(eval '(quote + 1 2) 'env)
