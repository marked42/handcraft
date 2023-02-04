#lang sicp

; arguments evaluation order left to right
(define (list-of-values-left-to-right exps env)
  (if (no-operands? exps)
      '()
      (let ((first (eval (first-operand exp) env)))
        (cons first
              (list-of-values (rest-operands exps) env)))))
