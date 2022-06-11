# JSON

A simple JSON parser.

## 类型推断问题

1. use never to specify a function throws error
1. assert function

```ts
// number
function getNumber(val: number) {
    if (val === 1) {
        return 1;
    }

    throw new Error("invalid");
}

const error = () => {
    throw new Error("invalid");
};

// number | undefined
function getNumber1(val: number) {
    if (val === 1) {
        return 1;
    }

    error();
}
```
