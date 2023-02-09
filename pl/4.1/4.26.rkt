#lang sicp

(define (tagged-list? exp tag)
  (if (pair? exp)
      (eq? (car exp) tag)
      false))

(define (unless? exp) (tagged-list? exp 'unless))
(define (unless-predicate exp) (cadr exp))
(define (unless-alternative exp) (caddr exp))
(define (unless-consequent exp)
  (if (not (null? (cdddr exp)))
      (cadddr exp)
      'false
      )
  )

(define (unless->if exp)
  (make-if
   (unless-predicate exp)
   (unless-consequent exp)
   (unless-alternative exp)
   )
  )

(define (make-if predicate consequent alternative)
  (list 'if predicate consequent alternative)
  )

(unless->if '(unless 1 2 3))
(unless->if '(unless 1 2))
