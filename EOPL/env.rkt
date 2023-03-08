#lang eopl

(define-datatype environment environment?
    (empty-env)
    (extend-env
        (var identifier?)
        (val expval?)
        (env environment?)
    )
    (extend-env-rec
        (p-name identifier?)
        (b-var identifier?)
        (body expression?)
        (env environment?)
    )
)

(define (apply-env env var)
    (cases environment env
        (empty-env ()
            (report-no-binding-found var)
        )
        (extend-env (saved-var saved-val saved-env)
            (if (eqv? saved-var var)
                saved-val
                (apply-env saved-env var)
            )
        )
        (extend-env-rec (p-name b-var p-body saved-env)
            (if (eqv? (p-name var))
                (proc-val (procedure b-var p-body env))
                (apply-env saved-env var)
            )
        )
    )
)

(define (report-no-binding-found var)
  (eopl:error 'apply-env "No binding for ~s" var)
  )

(define (report-invalid-env env)
  (eopl:error 'apply-env "Bad environment: ~s" env)
  )
