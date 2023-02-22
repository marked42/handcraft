#lang eopl

(define-datatype program program?
  (a-program (exp1 expression?))
  )

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
  ;   (var-exp
  ;    (var identifier?))
  ;   (let-exp
  ;    (var identifier?)
  ;    (exp1 expression?)
  ;    (body expression)
  ;    )
  )

(define-datatype expval expval?
  (num-val (num number?))
  (bool-val (bool boolean?))
  )

(define (expval->num val)
  (cases expval val
    (num-val (num) num)
    (else (report-expval-extractor-error 'num val))
    )
  )

(define (expval->bool val)
  (cases expval val
    (bool-val (bool) bool)
    (else (report-expval-extractor-error 'bool val))
    )
  )

(define empty-env '())
(define (init-env)
  (extend-env
   'i (num-val 1)
   (extend-env 'v (num-val 5)
               (extend-env 'x (num-val 10)
                           empty-env)
               )
   )
  )
