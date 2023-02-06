#lang sicp

; (define (while? exp) (tagged-list exp 'while))

(define (while-condition exp) (cadr exp))
(define (while-body exp) (cddr exp))
; (while condition ...body)
; (define (loop)
;   (if condition
;     body
;     (loop)
;     ()
;   )
; )
; (loop)
(define while-exp '(while (< a 10) (display a) a))

(while-condition while-exp)
(while-body while-exp)
(define (while->recursive-call exp)
  (list
    'begin
    (list
      'define
      (list 'loop)
      (list 'if (while-condition exp) (while-body exp) '(loop) '())
    )
    '(loop)
  )
)

; (begin (define (loop) (if (< a 10) ((display a) a) (loop) ())) (loop))
(while->recursive-call while-exp)
