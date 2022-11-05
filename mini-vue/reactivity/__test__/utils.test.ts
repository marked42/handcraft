import { getObjectType, hasChanged, isIntegerKey } from '../src/utils'

test('isIntegerKey', () => {
    const tests = [
        {
            value: '1',
            expected: true,
        },
        {
            value: '0',
            expected: true,
        },
        {
            value: '0.0',
            expected: false,
        },
        {
            value: 'a',
            expected: false,
        },
        {
            value: '-0',
            expected: false,
        },
    ]

    tests.forEach(({ value, expected }) =>
        expect(isIntegerKey(value)).toEqual(expected),
    )
})

test('getObjectType', () => {
    const values = [
        [{}, 'Object'],
        [new Map(), 'Map'],
        [new WeakMap(), 'WeakMap'],
        [new Set(), 'Set'],
        [new WeakSet(), 'WeakSet'],
        [new Array(), 'Array'],
        [function () {}, 'Function'],
    ] as const

    values.forEach(([value, type]) => {
        expect(getObjectType(value)).toEqual(type)
    })
})

test('hasChanged', () => {
    expect(hasChanged(NaN, NaN)).toBe(false)
    expect(hasChanged(0, 0)).toBe(false)
    expect(hasChanged(+0, -0)).toBe(false)
    expect(hasChanged(+0, +0)).toBe(false)
    expect(hasChanged(-0, -0)).toBe(false)

    expect(hasChanged(1, 0)).toBe(true)
    expect(hasChanged({}, {})).toBe(true)
})
