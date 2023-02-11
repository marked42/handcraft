#lang sicp

; macro for cons-stream
(define-syntax cons-stream
  (syntax-rules ()
    [(_ a b) (cons a (delay b))]
    )
  )

; delay proc with memo
(define (memo-proc proc)
  (let ((already-run? false) (result false))
    (lambda ()
      (if (not already-run?)
          (begin
            (set! result (proc))
            (set! already-run? true)
            result
            )
          result
          )
      )
    )
  )

(define (stream-car stream) (car stream))
(define (stream-cdr stream) (force (cdr stream)))

(define s (cons-stream 1 2))
; 1
; (stream-car s)
; 2
; (stream-cdr s)

(define the-empty-stream '())

; inifinite ones stream
(define (ones)
  (cons-stream 1 (ones))
  )

; 1
; (display (stream-car (stream-cdr (ones))))

(define (integer start)
  (cons-stream start (integer (+ start 1)))
  )

; 0
; (stream-car (integer 0))
; 1
; (stream-car (stream-cdr (integer 0)))

(define (stream-null? val)
  (eq? val the-empty-stream)
  )

(define (stream-ref s n)
  (if (= n 0)
      (stream-car s)
      (stream-ref (stream-cdr s) (- n 1))
      )
  )

(define (stream-map proc s)
  (if (stream-null? s)
      the-empty-stream
      (cons-stream (proc (stream-car s))
                   (stream-map proc (stream-cdr s))
                   )
      )
  )

(define (stream-for-each proc s)
  (if (stream-null? s)
      'done
      (begin (proc (stream-car s))
             (stream-for-each proc (stream-cdr s))
             )
      )
  )

(define (display-stream s)
  (stream-for-each display-line s)
  )

(define (display-line x)
  (display x)
  (newline)
  )

(define (head count s)
  (if (= count 0)
      the-empty-stream
      (cons-stream (stream-car s) (head (- count 1) (stream-cdr s)))
      )
  )

(define (stream-filter pred stream)
  (cond ((stream-null? stream) the-empty-stream)
        ((pred (stream-car stream))
         (cons-stream (stream-car stream)
                      (stream-filter pred (stream-cdr stream))))
        (else (stream-filter pred (stream-cdr stream)))
        )
  )

; 1 1 1 done
; (display-stream (head 3 (ones)))

; 0 1 2 3 4 5 done
; (display-stream (head 5 (integer 0)))

(define (even val) (eq? 0 (remainder val 2)))
(define (odd val) (eq? 1 (remainder val 2)))

; 1 3 5 7 9
(define first-five-odd-numbers (head 5 (stream-filter odd (integer 0))))
; (display-stream first-five-odd-numbers)

; 0 2 4 6 8
(define first-five-even-numbers (head 5 (stream-filter even (integer 0))))
; (display-stream first-five-even-numbers)

(define (stream-enumerate-interval low high)
  (if (> low high)
      the-empty-stream
      (cons-stream
       low
       (stream-enumerate-interval (+ low 1) high)
       )
      )
  )

(define (square x) (* x x))
; primes
(define (divides? a b) (= (remainder b a) 0))
(define (smallest-divisor n)
  (define (find-divisor n test-divisor)
    (cond ((> (square test-divisor) n) n)
          ((divides? test-divisor n) test-divisor)
          (else (find-divisor n (+ test-divisor 1)))
          )
    )
  (find-divisor n 2)
  )
(define (prime? n) (= n (smallest-divisor n)))

; 10009
; (stream-car
;     (stream-cdr
;         (stream-filter prime? (stream-enumerate-interval 10000 1000000))
;         )
; )

(define (sum-primes-1 a b)
  (define (iter count acc)
    (cond ((> count b) acc)
          ((prime? count) (iter (+ count 1) (+ count acc)))
          (else (iter (+ count 1 acc)))
          )
    )
  (iter a 0)
  )

; (define (sum-primes-2 a b)
;     (accumulate +
;                 0
;                 (filter prime? (enumerate-interval a b))
;     )
; )

; exer 3.50
(define (stream-map-v2 proc . streams)
  (if (stream-null? streams)
      the-empty-stream
      (let ((cars (map stream-car streams))
            (cdrs (map stream-cdr streams))
            )
        (cons-stream
         (apply proc cars)
         ; equal to (stream-map-v2 proc ...cdrs)
         (apply stream-map-v2 proc cdrs)
         )
        )
      )
  )

; (define integer-sum (stream-map-v2 + (integer 1) (integer 1)))
; (display-stream (head 5 integer-sum))
