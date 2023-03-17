#lang eopl

(define identifier? symbol?)

(define-datatype expression expression?
  (const-exp
   (num number?))
  (diff-exp
   (exp1 expression?)
   (exp2 expression?)
   )
  (zero?-exp
   (exp1 expression?)
   )
  (if-exp
   (exp1 expression?)
   (exp2 expression?)
   (exp3 expression?)
   )
  (var-exp
   (var identifier?))
  (let-exp
   (var identifier?)
   (exp1 expression?)
   (body expression?)
   )
  (letrec-exp
   (p-var identifier?)
   (b-name identifier?)
   (p-body expression?)
   (letrec-body expression?)
   )
  (proc-exp
   (var identifier?)
   (body expression?)
   )
  (call-exp
   (rator expression?)
   (rand expression?)
   )
  )

(define (cps-of-exp exp K)
  (cases expression expr
    (const-exp (num) (make-send-to-cont K (cps-const-exp n)))
    )
  )

(define (make-send-to-cont k-exp simple-exp)
  (let ((operator k-exp) (operands (list simple-exp)))
    (cps-call-exp operator operands)
    )
  )
