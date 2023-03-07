#lang eopl

(require rackunit)
(require "ch2.rkt")
(require "store.rkt")

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
  (assign-exp
   (var identifier?)
   (exp1 expression?)
   )

  (let-exp
   (var identifier?)
   (exp1 expression?)
   (body expression?)
   )

  (begin-exp
    (exp1 expression?)
    (exps (list-of expression?))
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
  (ref-val (ref reference?))
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

(define (expval->ref val)
  (cases expval val
    (ref-val (ref) ref)
    (else (report-expval-extractor-error 'ref val))
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
  (initialize-store!)
  (cases program prog
    (a-program (exp1)
               (value-of exp1 (init-env))
               )
    )
  )

(define (value-of exp env)
  (cases expression exp
    (const-exp (num) (num-val num))
    (var-exp (var) (deref (apply-env env var)))
    (assign-exp (var exp1)
                (let ((val1 (value-of exp1 env)))
                  (setref!
                   (apply-env env var)
                   val1
                   )
                  ; return arbitrary val
                  (num-val 27)
                  )
                )
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
                         (extend-env var (newref val1) env)
                         )
               )
             )

    (begin-exp (exp1 exps)
               (letrec
                   ((value-of-begins
                     (lambda (e1 es)
                       (let ((v1 (value-of e1 env)))
                         (if (null? es)
                             v1
                             (value-of-begins (car es) (cdr es)))))))
                 (value-of-begins exp1 exps)))

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

; represent language procedure as native procedure
; (define (procedure var body env)
;   (lambda (val)
;     (value-of body (extend-env var val env))
;     )
;   )

; (define (proc? val)
;   (procedure? val)
;   )

; (define (apply-procedure proc1 val)
;   (proc1 val)
;   )

; represent procedure as custom data structure
(define-datatype proc proc?
  (procedure
   (var identifier?)
   (body expression?)
   (saved-env environment?)
   )
  )

(define (apply-procedure proc1 val)
  (cases proc proc1
    (procedure (var body saved-env)
               (value-of body (extend-env var (newref val) saved-env))
               )
    )
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

    (expression
     ("begin" expression (arbno ";" expression) "end")
     begin-exp)

    (expression
     ("proc" "(" identifier ")" expression)
     proc-exp
     )

    (expression
     ("(" expression expression ")")
     call-exp
     )

    (expression
     ("set" identifier "=" expression)
     assign-exp
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

; 1. newref in let-exp / apply-procedure copy value
; 1. deref var-exp
; 1. setref set-exp
(equal-answer? (run "
let x = 1
  in let y = x
   in begin
    set y = 2;
    x
   end
") 1 "call by value")