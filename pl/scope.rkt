#lang racket

(lambda (x1 y1)
  (let ((z (+ x1 y1)))
    (lambda (x2 z2)
      (let ((x3 (let ((x4 (+ x2 y1 z2)) (y 11)) (+ x4 y z2))))
        (+ x3 y1 z2)
        )
      )
    )
  )
