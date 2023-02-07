#lang sicp

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

(define (extend-environment vars vals base-env)
  (if (= (length vars) (length vals))
      (cons (make-frame vars vals) base-env)
      (if (< (length vars) (length vals))
          (error "Too many arguments supplied" vars vals)
          (error "Too few arguments supplied" vars vals)
          )
      )
  )

(define (lookup-variable-value var env)
  (define (env-loop env)
    (define (scan vars vals)
      (cond
        ((null? vars) (env-loop (enclosing-environment env)))
        ((eq? var (car vars)) (car vals))
        (else (scan (cdr vars) (cdr vals)))))
    (if (eq? env the-empty-environment)
        (error "Unbound variable" var)
        (let ((frame (first-frame env)))
          (scan (frame-variables frame) (frame-values frame)))))
  (env-loop env))

(define (set-variable-value! var val env)
  (define (env-loop env)
    (define (scan vars vals)
      (cond
        ((null? vars) (env-loop (enclosing-environment env)))
        ((eq? var (car vars)) (set-car! vals val))
        (else (scan (cdr vars) (cdr vals)))))
    (if (eq? env the-empty-environment)
        (error "Unbound variable: SET!" var)
        (let ((frame (first-frame env)))
          (scan (frame-variables frame) (frame-values frame)))))
  (env-loop env))

(define (define-variable! var val env)
  (let ((frame (first-frame env)))
    (define (scan vars vals)
      (cond
        ((null? vars) (add-binding-to-frame! var val frame))
        ((eq? var (car vars)) (set-car! vals val))
        (else (scan (cdr vars) (cdr vals)))))
    (scan (frame-variables frame) (frame-values frame))))

; primitive procedure
(define primitive-procedures
  (list
   (list 'car car)
   (list 'cdr cdr)
   (list 'cons cons)
   (list 'null? null?)
   (list '+ +)
   ; more primitive procedures
   )
  )

(define (primitive-procedure-names)
  (map car primitive-procedures)
  )

(define (primitive-procedure-objects)
  (map
   (lambda (proc) (list 'primitive (cadr proc)))
   primitive-procedures))

(define (setup-environment)
  (let
      ((initial-env (extend-environment (primitive-procedure-names) (primitive-procedure-objects) the-empty-environment)))
    (define-variable! 'true true initial-env)
    (define-variable! 'false false initial-env)
    initial-env))

(define (true? val) (not (eq? val false)))
(define (false? val) (eq? val false))

(define the-global-environment (setup-environment))

(define (eval exp) ((analyze exp) the-global-environment))

(define (analyze exp)
  (cond ((self-evaluating? exp) (analyze-self-evaluating exp))
        ((quoted? exp) (analyze-quoted exp))
        ((variable? exp) (analyze-variable exp))
        ((assignment? exp) (analyze-assignment exp))
        ((definition? exp) (analyze-definition exp))
        ((if? exp) (analyze-if exp))
        ((begin? exp) (analyze-sequence (begin-actions exp)))
        ((lambda? exp) (analyze-lambda exp))
        ((application? exp) (analyze-application exp))
        (else (error "Unknown expression type: ANALYZE" exp))
        )
  )

(define (self-evaluating? exp)
  (cond ((number? exp) true)
        ((string? exp) true)
        (else false)
        )
  )

(define (analyze-self-evaluating exp)
  (lambda (env) exp)
  )

; (analyze '1)
; (eval '1)

(define (tagged-list? exp tag)
  (if (pair? exp)
      (eq? (car exp) tag)
      false))

(define (quoted? exp) (tagged-list? exp 'quote))

(define (analyze-quoted exp)
  (define val (text-of-quotation exp))
  (lambda (env) val)
  )

(define (text-of-quotation exp) (cdr exp))

; (analyze '(quote 1 2 3))
; (eval '(quote 1 2 3))

(define (variable? exp) (symbol? exp))
(define (analyze-variable exp)
  (lambda (env) (lookup-variable-value exp env))
  )

; (analyze '+)
; (eval '+)

(define (assignment? exp) (tagged-list? exp 'set!))
(define (assignment-variable exp) (cadr exp))
(define (assignment-value exp) (caddr exp))
(define (analyze-assignment exp)
  (let ((var (assignment-variable exp))
        (vproc (analyze (assignment-value exp)))
        )
    (lambda (env)
      (set-variable-value! var (vproc env) env)
      'ok)
    )
  )

; (analyze-assignment '(set! a 1))
; + is primitive variable
; (eval '(set! + 1))


(define (definition? exp) (tagged-list? exp 'define))
(define (definition-variable exp) (cadr exp))
(define (definition-value exp) (caddr exp))

(define (analyze-definition exp)
  (let ((var (definition-variable exp))
        (vproc (analyze (definition-value exp)))
        )
    (lambda (env)
      (define-variable! var (vproc env) env)
      'ok
      )
    )
  )

; (analyze-definition '(define a 1))
; (eval '(define a 1))

(define (if? exp) (tagged-list? exp 'if))
(define (if-predicate exp) (cadr exp))
(define (if-consequent exp) (caddr exp))
(define (if-alternative exp) (cadddr exp))
(define (analyze-if exp)
  (let ((pproc (analyze (if-predicate exp)))
        (cproc (analyze (if-consequent exp)))
        (aproc (analyze (if-alternative exp))))
    (lambda (env)
      (if (true? (pproc env))
          (cproc env)
          (aproc env)
          )
      )
    )
  )

; (eval '(if true 2 3))
; (eval '(if false 2 3))

(define (begin? exp) (tagged-list? exp 'begin))
(define (begin-actions exp) (cdr exp))
(define (analyze-sequence exps)
  (if (null? exps)
      (error "Empty sequence: ANALYZE")
      (let ((procs (map analyze exps)))
        (lambda (env)
          (define r '())
          (define (loop procs)
            (if (pair? procs)
                (begin
                  (set! r ((car procs) env))
                  (loop (cdr procs))
                  )
                )
            )
          (loop procs)
          r
          )
        )
      )
  )

; (define begin-exp '(begin 1 2 3))
; (begin-actions begin-exp)
; (analyze begin-exp)
; (eval begin-exp)

(define (lambda? exp) (tagged-list? exp 'lambda))
(define (lambda-parameters exp) (cadr exp))
(define (lambda-body exp) (caddr exp))
(define (make-lambda parameters body)
  (cons 'lambda (cons (parameters body)))
  )

(define (make-procedure parameters body env)
  (list 'procedure parameters body env)
  )

(define (analyze-lambda exp)
  (let ((vars (lambda-parameters exp))
        (bproc (analyze-sequence (lambda-body exp))))
    (lambda (env)
      (make-procedure vars bproc env)
      )
    )
  )

; (analyze '(lambda (x) (+ x x)))
; TODO:
; (analyze '((lambda (x) (+ x x)) 2))
; (eval '((lambda (x) (+ x x)) 2))

(define (application? exp) (pair? exp))
(define (application-callee exp) (car exp))
(define (application-arguments exp) (cdr exp))

; transform callee and arguments into procs
(define (analyze-application exp)
  (let ((callee-proc (analyze (application-callee exp)))
        (arguments-proc (map analyze (application-arguments exp))))
    (lambda (env)
      (let ((callee (callee-proc env))
            (arguments (map (lambda (arg) (arg env)) arguments-proc)))
        (my-apply callee arguments)
        )
      )
    )
  )

(define (primitive-procedure? proc)
  (tagged-list? proc 'primitive))
(define (primitive-implementation proc) (cadr proc))
(define (apply-primitive-procedure proc args)
  (apply (primitive-implementation proc) args)
  )

(define (compound-procedure? p) (tagged-list? p 'procedure))
(define (procedure-parameters p) (cadr p))
(define (procedure-body p) (caddr p))
(define (procedure-environment p) (cadddr p))

(define (my-apply procedure arguments)
  (cond
    ((primitive-procedure? procedure)
     (apply-primitive-procedure procedure arguments))
    ((compound-procedure? procedure)
     ; compound procedure ('procedure parameters body env)
     ; parameters are symbols, body is a procedure, env is when precedure is created
     (let ((body (procedure-body procedure))
           (parameters (procedure-parameters procedure))
           (env (procedure-environment procedure)))
       (body (extend-environment parameters arguments env))
       )
     )
    (else (error "Unknown procedure type: APPLY" procedure))))

(define application-exp '(+ 1 1))
; (application-callee application-exp)
; (application-arguments application-exp)
; (analyze '(+ 1 1))
(eval '(+ 1 3))
