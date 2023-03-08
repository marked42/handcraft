#lang eopl

(require rackunit)
(require "ch2.rkt")

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

(define identifier? symbol?)

(define-datatype expval expval?
  (num-val (num number?))
  (bool-val (bool boolean?))
  (proc-val (proc proc?))
  )

(define (expval->num val)
  (cases expval val
    (num-val (num) num)
    (else (report-expval-extractor-error 'num val))
    )
  )

(define (expval->proc val)
  (cases expval val
    (proc-val (proc) proc)
    (else (report-expval-extractor-error 'proc val))
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

(define (report-expval-extractor-error type val)
  (eopl:error 'expval-extractors "Looking for a ~s, found ~s" type val)
  )

(define (run string)
  (value-of-program (scan&parse string))
  )

(define (value-of-program prog)
  (cases program prog
    (a-program (exp1)
               (value-of exp1 (init-env))
               )
    )
  )

(define (value-of exp env)
  (cases expression exp
    (const-exp (num) (num-val num))
    (var-exp (var) (apply-env env var))
    (diff-exp (exp1 exp2)
              (let ((val1 (value-of exp1 env))
                    (val2 (value-of exp2 env)))
                (let ((num1 (expval->num val1))
                      (num2 (expval->num val2))
                      )
                  (num-val (- num1 num2))
                  )
                )
              )
    (zero?-exp (exp1)
               (let ((val1 (value-of exp1 env)))
                 (let ((num1 (expval->num val1)))
                   (if (zero? num1)
                       (bool-val #t)
                       (bool-val #f)
                       )
                   )
                 )
               )
    (if-exp (exp1 exp2 exp3)
            (let ((val1 (value-of exp1 env)))
              (if (expval->bool val1)
                  (value-of exp2 env)
                  (value-of exp3 env)
                  )
              )
            )
    (let-exp (var exp1 body)
             (let ((val1 (value-of exp1 env)))
               (value-of body
                         (extend-env var val1 env)
                         )
               )
             )
    (letrec-exp (p-name b-var p-body letrec-body)
             (let ((val1 (value-of exp1 env)))
               (value-of letrec-body
                         (extend-env-rec p-name b-var p-body env)
                         )
               )
             )
    (proc-exp (var body)
              (proc-val (procedure var body env))
              )
    (call-exp (rator rand)
              (let ((proc (expval->proc (value-of rator env)))
                    (arg (value-of rand env))
                    )
                (apply-procedure proc arg)
                )
              )
    )
  )

(define (procedure var body env)
  (lambda (val)
    (value-of body (extend-env var val env))
    )
  )

(define (proc? val)
  (procedure? val)
  )

(define (apply-procedure proc1 val)
  (proc1 val)
  )

(define the-lexical-spec
  '((whitespace (whitespace) skip)
    (comment ("%" (arbno (not #\newline))) skip)
    (identifier
     (letter (arbno (or letter digit "_" "-" "?")))
     symbol)
    (number (digit (arbno digit)) number)
    (number ("-" digit (arbno digit)) number)
    ))

(define the-grammar
  '((program (expression) a-program)

    (expression (number) const-exp)
    (expression
     ("-" "(" expression "," expression ")")
     diff-exp)

    (expression
     ("zero?" "(" expression ")")
     zero?-exp)

    (expression
     ("if" expression "then" expression "else" expression)
     if-exp)

    (expression (identifier) var-exp)

    (expression
     ("let" identifier "=" expression "in" expression)
     let-exp)

    (epxression
      ("letrec" identifier "(" identifier ")" "=" expression "in" expression)
      letrec-exp
    )

    (expression
     ("proc" "(" identifier ")" expression)
     proc-exp
     )

    (expression
     ("(" expression expression ")")
     call-exp
     )
    ))

(define scan&parse
  (sllgen:make-string-parser the-lexical-spec the-grammar))


(define equal-answer?
  (lambda (ans correct-ans msg)
    (check-equal? ans (sloppy->expval correct-ans) msg)))

(define sloppy->expval
  (lambda (sloppy-val)
    (cond
      ((number? sloppy-val) (num-val sloppy-val))
      ((boolean? sloppy-val) (bool-val sloppy-val))
      (else
       (eopl:error 'sloppy->expval
                   "Can't convert sloppy value to expval: ~s"
                   sloppy-val)))))

; (equal-answer? (run "11") 11 "number")
; (equal-answer? (run "-(11, 1)") 10 "number")
; (equal-answer? (run "if zero? (0) then 1 else 2") 1 "if-exp")
; (equal-answer? (run "if zero? (1) then 1 else 2") 2 "if-exp")
; (equal-answer? (run "let x = 1 in x") 1 "let")

; (equal-answer? (run "let f = proc (x) -(x,11) in (f (f 77))") 55 "proc")

(equal-answer? (run "
letrec double(x)
= if zero?(x) then 0 else -((double -(x,1)), -2)
in (double 6)
") 1 "letrec")
