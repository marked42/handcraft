function ones() {
    return [1, ones];
}

function car(stream) {
    return stream[0];
}

function cdr(stream) {
    return stream[1]();
}

console.log(car(ones()));
console.log(car(cdr(ones())));

// cannot access before initialization
const twos = [2, twos];
