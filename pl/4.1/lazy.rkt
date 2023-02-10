#lang sicp

(define (true? val) (not (eq? val false)))
(define (false? val) (eq? val false))

(define (eval exp env)
  (cond
    ((self-evaluating? exp) exp)
    ((quoted? exp) (text-of-quotation exp))
    ((variable? exp) (lookup-variable-value exp env))
    ((assignment? exp) (eval-assignment exp env))
    ((definition? exp) (eval-definition exp env))
    ((and? exp) (eval-and (cdr exp) env))
    ((or? exp) (eval (or->if (cdr exp)) env))
    ((if? exp) (eval-if exp env))
    ((lambda? exp) (make-procedure (lambda-parameters exp)
                                   (lambda-body exp)
                                   env))
    ((begin? exp) (eval-sequence (begin-actions exp) env))
    ((cond? exp) (eval (cond->if exp) env))
    ((application? exp) (lazy-apply (actual-value (operator exp) env)
                                    (operands exp) env))
    (else (error "Unkown expression type: EVAL" exp))))

(define (and? exp) (tagged-list? exp 'and))
(define (eval-and exps env)
  (cond
    ((null? exps) true)
    ((false? (eval (car exps) env)) false)
    (else (eval-and (cdr exps) env))
    )
  )

; implement or as derived expression
(define (or? exp) (tagged-list? exp 'or))
(define (or->if exps)
  (define (loop exps)
    (if (null? exps)
        'false
        (make-if (car exps) 'true (loop (cdr exps)))
        )
    )
  (loop exps)
  )

(define (self-evaluating? exp)
  (cond ((number? exp) true)
        ((string? exp) true)
        (else false)))

(define (quoted? exp) (tagged-list? exp 'quote))

; assignment (set! a 1)
(define (assignment? exp) (tagged-list? exp 'set!))
(define (assignment-variable exp) (cadr exp))
(define (assignment-value exp) (caddr exp))
(define (eval-assignment exp env)
  (set-variable-value! (assignment-variable exp)
                       (eval (assignment-value exp) env)
                       env)
  )

; definition
; (define <var> <value>)
; (define (<var> <parameter1> ... <parametern>) <body>)
(define (definition? exp) (tagged-list? exp 'define))
(define (definition-variable exp)
  (if (symbol? (cadr exp))
      (cadr exp)
      (caadr exp)))

(define (definition-value exp)
  (if (symbol? (cadr exp))
      (caddr exp)
      (make-lambda (cdadr exp) (cddr exp))))

; lambda
(define (make-lambda parameters body)
  (cons 'lambda (cons parameters body)))
(define (lambda? exp) (tagged-list? exp 'lambda))
(define (lambda-parameters exp) (cadr exp))
(define (lambda-body exp) (cddr exp))

(define (eval-definition exp env)
  (define-variable! (definition-variable exp)
    (eval (definition-value exp) env)
    env)
  )

; conditional
(define (if? exp) (tagged-list? exp 'if))
(define (eval-if exp env)
  (if (true? (actual-value (if-predicate exp) env))
      (eval (if-consequent exp) env)
      (eval (if-alternative exp) env)))
(define (if-predicate exp) (cadr exp))
(define (if-consequent exp) (caddr exp))
(define (if-alternative exp)
  (if (not (null? (cdddr exp)))
      (cadddr exp)
      'false))
(define (make-if predicate consequent alternative)
  (list 'if predicate consequent alternative))

; sequence
(define (eval-sequence exps env)
  (cond
    ((last-exp? exps) (eval (first-exp exps) env))
    (else
     (eval (first-exp exps) env)
     (eval-sequence (rest-exps exps) env)
     )
    )
  )

(define (last-exp? exps) (null? (cdr exps)))
(define (first-exp exps) (car exps))
(define (rest-exps exps) (cdr exps))

; begin
(define (begin? exp) (tagged-list? exp 'begin))
(define (begin-actions exp) (cdr exp))
(define (make-begin seq) (cons 'begin seq))

(define (sequence->exp seq)
  (cond
    ((null? seq) seq)
    ((last-exp? seq) (first-exp seq))
    (else (make-begin seq))
    )
  )

; (cond (predicate ...actions) (predicate ...actions) (else ...actions))
(define (cond? exp) (tagged-list? exp 'cond))
(define (cond-clauses exp) (cdr exp))
(define (cond->if exp) (expand-clauses (cond-clauses exp)))

(define (cond-else-clause? clause)
  (eq? (cond-predicate clause) 'else)
  )

(define (cond-predicate clause) (car clause))
(define (cond-actions clause) (cdr clause))

(define (expand-clauses clauses)
  (if (null? clauses)
      'false
      (let ((first (car clauses)) (rest (cdr clauses)))
        (if (cond-else-clause? first)
            (if (null? rest)
                (sequence->exp (cond-actions first))
                (error "ELSE clause isn't last: COND->IF" clauses))
            (make-if (cond-predicate first)
                     (sequence->exp (cond-actions first))
                     (expand-clauses rest))))))

(define (text-of-quotation exp) (cdr exp))

(define (tagged-list? exp tag)
  (if (pair? exp)
      (eq? (car exp) tag)
      false))

(define (variable? exp) (symbol? exp))

; environment
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


(define (application? exp) (pair? exp))
(define (operator exp) (car exp))
(define (operands exp) (cdr exp))
(define (no-operands? ops) (null? ops))
(define (first-operand ops) (car ops))
(define (rest-operands ops) (cdr ops))

; list-of-values arguments evaluation order depends on arguments evaluation order of cons
(define (list-of-values exps env)
  (if (no-operands? exps)
      '()
      (cons (eval (first-operand exps) env)
            (list-of-values (rest-operands exps) env))))

; exer 4.1 arguments evaluation order left to right
(define (list-of-values-left-to-right exps env)
  (if (no-operands? exps)
      '()
      (let ((first (eval (first-operand exp) env)))
        (cons first
              (list-of-values (rest-operands exps) env)))))

(define (my-apply procedure arguments)
  (cond
    ((primitive-procedure? procedure)
     (apply-primitive-procedure procedure arguments))
    ((compound-procedure? procedure)
     (eval-sequence
      (procedure-body procedure)
      (extend-environment
       (procedure-parameters procedure)
       arguments
       (procedure-environment procedure)
       )))
    (else (error "Unknown procedure type: APPLY" procedure))))


; primitive procedure
(define primitive-procedures
  (list
   (list 'car car)
   (list 'cdr cdr)
   (list 'cons cons)
   (list 'null? null?)
   (list '+ +)
   (list '= =)
   (list 'display display)
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

(define (primitive-procedure? proc)
  (tagged-list? proc 'primitive))
(define (primitive-implementation proc) (cadr proc))

(define (apply-primitive-procedure proc args)
  (apply (primitive-implementation proc) args)
  )

; compound procedure
(define (make-procedure parameters body env)
  (list 'procedure parameters body env)
  )
(define (compound-procedure? p) (tagged-list? p 'procedure))
(define (procedure-parameters p) (cadr p))
(define (procedure-body p) (caddr p))
(define (procedure-environment p) (cadddr p))

(define (setup-environment)
  (let
      ((initial-env (extend-environment (primitive-procedure-names) (primitive-procedure-objects) the-empty-environment)))
    (define-variable! 'true true initial-env)
    (define-variable! 'false false initial-env)
    initial-env))

(define the-global-environment (setup-environment))

(define (lazy-apply procedure arguments env)
  (cond
    ((primitive-procedure? procedure)
     (apply-primitive-procedure
      procedure
      (list-of-arg-values arguments env))
     )
    ((compound-procedure? procedure)
     (eval-sequence
      (procedure-body procedure)
      (extend-environment
       (procedure-parameters procedure)
       (list-of-delayed-args arguments env)
       (procedure-environment procedure)
       )
      )
     )
    (else 1)
    ))

(define (list-of-arg-values exps env)
  (map (lambda (exp) (actual-value exp env)) exps)
  )


(define (list-of-delayed-args exps env)
  (map (lambda (exp) (delay-it exp env)) exps)
  )

(define (delay-it exp env)
  (list 'thunk exp env)
  )

(define (thunk? obj)
  (tagged-list? obj 'thunk)
  )

(define (thunk-exp obj) (cadr obj))
(define (thunk-env obj) (caddr obj))

(define (evaluated-thunk? obj)
  (tagged-list? obj 'evaluated-thunk)
  )
(define (thunk-value evaluated-thunk)
  (car evaluated-thunk)
  )

(define (actual-value exp env)
  (force-it (eval exp env))
  )

(define (force-it obj)
  (cond ((thunk? obj)
         (let ((result (actual-value (thunk-exp obj) (thunk-env obj))))
           (set-car! obj 'evaluated-thunk)
           ; replace with evaluated value
           (set-car! (cdr obj) result)
           ; forget unneeded env
           (set-cdr! (cdr obj) '())
           result
           ))
        ((evaluated-thunk? obj) (thunk-value obj))
        (else obj)
        )
  )

; (eval '(begin (define (try a b) (if (= a 0) 1 b)) (try 0 (/ 1 0))) the-global-environment)

; exer 4.27
(eval '(begin (define count 0) (define (id x) (set! count (+ count 1)) x) (define w (id (id 10))) (display count) (display w) (display count)) the-global-environment)
; 1. define w calls id once for initialization, count incremented to 1, delayed argument (id 10) is returned
; count
; 2. read w uses primitive procedure car to get its value, which forces delayed (id 10) and get actual value 10, count is incremented to 2,
; w
; 3. 2
; count
