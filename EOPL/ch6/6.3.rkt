#lang eopl

; 1.
(lambda(x y) (p (+ 8 x) (q y)))
(lambda (x y cont)
  (q y (lambda (val) (p (+ 8 x) val cont)))
  )

; 2.
(lambda (x y u v) (+ 1 (f (g x y) (+ u v))))

(lambda (x y u v cont)
  (g x y
     (lambda (val1)
       (f val (+ u v) (lambda (val2)
                        (cont (+ 1 val2))
                        ))
       ))
  )

; 3.
(+ 1 (f (g x y) (+ u (h v))))

(g x y (lambda (val1)
         (h v (lambda (val2)
                (f val1 (+ u val2) (lambda (val3)
                                     (cont (+ 1 val3))
                                     ))
                ))
         ))
; 4.
(zero? (if a (p x) (p y)))
(if a
    (p x (lambda (val)
           (cont (zero? val))
           ))
    (p y (lambda (val)
           (cont (zero? val))
           ))
    )

; 5.
(zero? (if (f a) (p x) (p y)))
(f a (lambda (val1)
       (if val1
           (p x (lambda (val)
                  (cont (zero? val))
                  ))
           (p y (lambda (val)
                  (cont (zero? val))
                  ))
           )
       ))

; 6.
(let ((x (let ((y 8)) (p y)))) x)
(let ((y 8))
  (p y (lambda (val1)
         (let ((x val1))
           (cont x)
           )
         ))
  )

; 7.
(let ((x (if a (p x) (p y)))) x)

(if a
    (p x (lambda (val)
           (let ((x val))
             (cont x)
             )
           ))
    (p y (lambda (val)
           (let ((x val))
             (cont x)
             )
           ))
    )
