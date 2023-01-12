// type ExprNumber = number;
// type Expr = [Expr, Expr] | ExprNumber;

// type Callback = (result: number) => void;

function evaluate(input, callback) {
    if (!Array.isArray(input)) {
        callback(input);
    } else {
        evaluate(input[0], (left) => {
            evaluate(input[1], (right) => {
                callback(left + right);
            });
        });
    }
}

function evalM(input) {
    if (!Array.isArray(input)) {
        return input;
    }

    return evalM(input[0]) + evalM(input[1]);
}

function genNums(depth) {
    let nums = [1, 1];
    for (let i = 0; i < depth; i++) {
        nums = [1, nums];
    }

    return nums;
}
const nums = genNums(1);

evaluate(nums, (result) => {
    console.log("result: ", result);
});

// evalM(nums, (result) => {
//     console.log("resultM: ", result);
// });
