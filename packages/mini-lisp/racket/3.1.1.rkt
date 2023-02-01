#lang racket

(define balance 100)
(define (withdraw amount)
    (if (>= balance amount)
        (begin (set! balance (- balance amount))
            balance)
        "Insufficient funds"))

(withdraw 25)
(withdraw 25)
(withdraw 60)
(withdraw 15)

; new-withdraw with fixed initial balance 100
(define new-withdraw
    (let ((balance 100))
        (lambda (amount)
            (if (>= balance amount)
                (begin (set! balance (- balance amount)) balance)
                "Insufficient funds"))))

; make-withdraw create a lambda of initial balance
(define (make-withdraw balance)
    (lambda (amount)
        (if (>= balance amount)
            (begin (set! balance (- balance amount)) balance)
            "Insufficient funds")))

(define W1 (make-withdraw 100))
(define W2 (make-withdraw 100))

(W1 50)
;50
(W2 70)
;30
(W2 40)
;"Insufficient funds"
(W1 40)
;10


(define (make-account balance)
    (define (withdraw amount)
        (if (>= balance amount)
            (begin
                (set! balance (- balance amount))
                balance)
            "Insufficient funds"))
    (define (deposit amount)
        (set! balance (+ balance amount))
        balance)
    (define (dispatch m)
        (cond
            ((eq? m 'withdraw) withdraw)
            ((eq? m 'deposit) deposit)
            (else (error "Unknown request: MAKE-ACCOUNT" m))))
    dispatch)

(define acc (make-account 100))
((acc 'withdraw) 50)
;50
((acc 'withdraw) 60)
;"Insufficient funds"
((acc 'deposit) 40)
;90
((acc 'withdraw) 60)
;30

; acc2 is a separate account from acc
(define acc2 (make-account 100))

; Exercise 3.1
(define (make-accumulator sum)
    (lambda (val)
        (set! sum (+ val sum))
        sum
    )
)

(define A (make-accumulator 5))
(A 10)
;15
(A 10)
;25

; Exercise 3.2
(define (make-monitored f)
    (define count 0)
    (lambda (val)
        (cond
            ((eq? val 'how-many-calls?) count)
            ((eq? val 'reset-count) (set! count 0))
            (else
                (begin
                    (set! count (+ count 1))
                    (f val)
                )
            )
        )
    )
)

(define s (make-monitored sqrt))
(s 100)
;10
(s 'how-many-calls?)
;1

; Exercise 3.3
(define (make-secret-account balance secret)
    (define (withdraw amount)
        (if (>= balance amount)
            (begin
                (set! balance (- balance amount))
                balance)
            "Insufficient funds"))
    (define (deposit amount)
        (set! balance (+ balance amount))
        balance)
    (define (incorrect amount)
        "Incorrect password")
    (define (dispatch input m)
        (cond
            ((not (eq? input secret)) incorrect)
            ((eq? m 'withdraw) withdraw)
            ((eq? m 'deposit) deposit)
            (else (error "Unknown request: MAKE-ACCOUNT" m))))
    dispatch)

(define secret-account (make-secret-account 100 'secret-password))
((secret-account 'secret-password 'withdraw) 40)
;60
((secret-account 'some-other-password 'deposit) 50)
;"Incorrect password"
