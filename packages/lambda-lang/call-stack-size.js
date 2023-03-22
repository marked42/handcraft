// function computeMaxCallStackSize() {
//     try {
//         return 1 + computeMaxCallStackSize();
//     } catch (e) {
//         // Call stack overflow
//         return 1;
//     }
// }

function computeMaxCallStackSize(size) {
    size = size || 1;
    return computeMaxCallStackSize(size + 1);
}

console.log(computeMaxCallStackSize())
