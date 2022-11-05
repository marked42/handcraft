import { effect, isReactive, reactive, toRaw } from '../src'
import { getTargetType, TargetType } from '../src/reactive'

describe('reactive/object', () => {
    test('object', () => {
        const value = { name: 'tom' }
        const observed = reactive(value)

        expect(observed).not.toBe(value)
        expect(isReactive(value)).toBe(false)
        expect(isReactive(observed)).toBe(true)

        expect(observed.name).toBe('tom')
        expect('name' in observed).toBe(true)
        expect(Object.keys(observed)).toEqual(['name'])
        expect(Object.getPrototypeOf(observed)).toBe(
            Object.getPrototypeOf(value),
        )
    })

    test('non-observable', () => {
        const assertValue = (value: any) => {
            return reactive(value)
        }

        expect(assertValue(1)).toBe(1)

        const value = Promise.resolve(1)
        expect(assertValue(value)).toBe(value)
    })

    test('nested reactive object', () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [{ bar: 2 }],
        }
        const observed = reactive(original)
        expect(isReactive(observed.nested)).toBe(true)
        expect(isReactive(observed.array)).toBe(true)
        expect(isReactive(observed.array[0])).toBe(true)
    })

    test('observed object should proxy mutations to original object', () => {
        const value = {
            name: 'tom',
        }
        const observed = reactive<{ name?: string }>(value)

        // set
        observed.name = 'jerry'
        expect(observed.name).toEqual('jerry')
        expect(value.name).toEqual('jerry')

        delete observed.name
        expect('name' in observed).toBe(false)
        expect('name' in value).toBe(false)
    })

    test('original value change should reflect on observed object', () => {
        const value: { name?: string } = {
            name: 'tom',
        }
        const observed = reactive(value)

        // set
        value.name = 'jerry'
        expect(observed.name).toEqual('jerry')
        expect(value.name).toEqual('jerry')

        delete value.name
        expect('name' in observed).toBe(false)
        expect('name' in value).toBe(false)
    })

    test('observing same object multiple times should return same Proxy', () => {
        const value = {
            tom: {
                age: 3,
            },
        }
        const observed1 = reactive(value)
        const observed2 = reactive(value)

        expect(observed1).toBe(observed2)
    })

    test('observing already observed object should return same Proxy', () => {
        const value = {
            tom: {
                age: 3,
            },
        }
        const observed1 = reactive(value)
        const observed2 = reactive(observed1)
        expect(observed1).toBe(observed2)
    })
})

describe('reactive/array', () => {
    test('should make Array reactive', () => {
        const original = [{ foo: 1 }]
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
        expect(isReactive(observed[0])).toBe(true)
        // get
        expect(observed[0].foo).toBe(1)
        // has
        expect(0 in observed).toBe(true)
        // ownKeys
        expect(Object.keys(observed)).toEqual(['0'])
    })

    test('cloned reactive Array should point to observed values', () => {
        const original = [{ foo: 1 }]
        const observed = reactive(original)
        const clone = observed.slice()
        expect(isReactive(clone[0])).toBe(true)
        expect(clone[0]).not.toBe(original[0])
        expect(clone[0]).toBe(observed[0])
    })

    test('observed value should proxy mutations to original (Array)', () => {
        const original: any[] = [{ foo: 1 }, { bar: 2 }]
        const observed = reactive(original)
        // set
        const value = { baz: 3 }
        const reactiveValue = reactive(value)
        observed[0] = value
        expect(observed[0]).toBe(reactiveValue)
        expect(original[0]).toBe(value)
        // delete
        delete observed[0]
        expect(observed[0]).toBeUndefined()
        expect(original[0]).toBeUndefined()
        // mutating methods
        observed.push(value)
        expect(observed[2]).toBe(reactiveValue)
        expect(original[2]).toBe(value)
    })

    test('update existed index should trigger effect', () => {
        const observed = reactive([0])

        let dummy
        effect(() => {
            dummy = observed[0]
        })

        expect(dummy).toEqual(0)
        observed[0] = 1
        expect(dummy).toEqual(1)
    })

    test('update existed index should not trigger length dependency', () => {
        const observed = reactive([{ foo: 1 }])

        let dummy
        effect(() => {
            dummy = observed.length
        })

        expect(dummy).toEqual(1)
        observed[0] = { foo: 2 }
        expect(dummy).toEqual(1)
    })

    test('add new element to array by setting index larger than length should trigger index dependency', () => {
        const observed = reactive([0])

        let dummy
        effect(() => {
            dummy = observed[3]
        })

        expect(dummy).toBeUndefined()
        observed[3] = 1
        expect(dummy).toEqual(1)
    })

    test('add new element to array by setting index larger than length should trigger length dependency', () => {
        const observed = reactive([0])

        let dummy
        effect(() => {
            dummy = observed.length
        })

        expect(dummy).toEqual(1)
        observed[3] = 1
        expect(dummy).toEqual(4)
    })

    test('delete array element should trigger index dependency', () => {
        const observed = reactive([{ foo: 1 }])

        let dummy
        effect(() => {
            dummy = observed[0]
        })

        expect(dummy).toEqual({ foo: 1 })
        delete observed[0]
        expect(dummy).toBeUndefined()
    })

    test('delete array element should not trigger length dependency', () => {
        const observed = reactive([{ foo: 1 }])

        const fnSpy = jest.fn(() => {
            observed.length
        })

        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)

        delete observed[0]
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    test('delete non-exist array element should not trigger index dependency', () => {
        const observed = reactive([{ foo: 1 }])

        let dummy
        const fnSpy = jest.fn(() => {
            dummy = observed[3]
        })
        effect(fnSpy)

        expect(dummy).toBeUndefined()
        expect(fnSpy).toHaveBeenCalledTimes(1)
        delete observed[3]
        expect(dummy).toBeUndefined()
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    test('delete non-exist array element should not trigger length dependency', () => {
        const observed = reactive([{ foo: 1 }])

        let dummy
        const fnSpy = jest.fn(() => {
            dummy = observed[3]
        })
        effect(fnSpy)

        expect(dummy).toBeUndefined()
        expect(fnSpy).toHaveBeenCalledTimes(1)
        delete observed[3]
        expect(dummy).toBeUndefined()
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    test('increment array length should trigger length dependency', () => {
        const observed = reactive([{ foo: 1 }])

        let dummy
        effect(() => {
            dummy = observed.length
        })

        expect(dummy).toEqual(1)
        observed.length = 3
        expect(dummy).toEqual(3)
    })

    test('decrement array length should trigger length dependency', () => {
        const observed = reactive([{ foo: 1 }, { foo: 2 }, { foo: 3 }])

        let dummy
        effect(() => {
            dummy = observed.length
        })

        expect(dummy).toEqual(3)
        observed.length = 2
        expect(dummy).toEqual(2)
    })

    test('decrement array length should trigger deleted elements', () => {
        const observed = reactive([{ foo: 1 }, { foo: 2 }, { foo: 3 }])

        let dummy
        effect(() => {
            dummy = observed[2]
        })

        expect(dummy).toEqual({ foo: 3 })
        observed.length = 2
        expect(dummy).toBeUndefined()
    })

    test('delete array length should not trigger length dependency', () => {
        const observed = reactive<{ length?: number }>([
            { foo: 1 },
            { foo: 2 },
            { foo: 3 },
        ])

        let dummy
        effect(() => {
            dummy = observed.length
        })

        expect(dummy).toEqual(3)
        expect(() => {
            delete observed.length
        }).toThrow()
        expect(dummy).toEqual(3)
    })

    test('should observe length when using for-in', () => {
        const observed = reactive([1])

        let dummy
        effect(() => {
            dummy = ''
            for (const name in observed) {
                dummy += name
            }
        })

        expect(dummy).toEqual('0')
        observed.length = 3
        expect(dummy).toEqual('0')
    })

    test('should observe length when using for-in', () => {
        const observed = reactive([1])

        let dummy
        effect(() => {
            dummy = ''
            for (const name in observed) {
                dummy += name
            }
        })

        expect(dummy).toEqual('0')
        observed.length = 3
        expect(dummy).toEqual('0')
    })

    test('should observe length when using Object.keys', () => {
        const observed = reactive([1])

        let dummy
        effect(() => {
            dummy = Object.keys(observed).join('')
        })

        expect(dummy).toEqual('0')
        observed.length = 3
        expect(dummy).toEqual('0')
    })

    test('should observe length when using for-of', () => {
        const observed = reactive([1])

        let dummy
        effect(() => {
            dummy = ''
            for (const name of observed) {
                dummy += name
            }
        })

        expect(dummy).toEqual('1')
        observed.length = 3
        expect(dummy).toEqual('1undefinedundefined')
    })

    test('set empty slot index should not trigger length dependency', () => {
        const observed = reactive([1, , 3])

        let dummy
        const fnSpy = jest.fn(() => {
            dummy = ''
            for (const name in observed) {
                dummy += name
            }
        })
        effect(fnSpy)

        expect(dummy).toEqual('02')
        expect(fnSpy).toHaveBeenCalledTimes(1)

        observed[1] = 3
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    test('identity-sensitive methods should respect original object', () => {
        const value1 = {}
        const rvalue1 = reactive(value1)
        const rarray = reactive([value1])

        expect(rarray[0] === value1).toBe(false)
        expect(rarray[0] === rvalue1).toBe(true)

        // respect proxy
        expect(rarray.indexOf(rvalue1)).toEqual(0)
        expect(rarray.includes(rvalue1)).toBe(true)
        expect(rarray.lastIndexOf(rvalue1)).toEqual(0)

        // respect original
        expect(rarray.indexOf(value1)).toEqual(0)
        expect(rarray.includes(value1)).toBe(true)
        expect(rarray.lastIndexOf(value1)).toEqual(0)
    })

    test('identity-sensitive methods should observe each index', () => {
        const value = reactive([1, 2, 3])

        let dummy
        effect(() => {
            dummy = value.indexOf(2)
        })

        expect(dummy).toBe(1)

        // trigger each index
        value[0] = 2
        expect(dummy).toBe(0)
        value[0] = 1
        expect(dummy).toBe(1)

        value[1] = 4
        expect(dummy).toBe(-1)

        value[2] = 2
        expect(dummy).toBe(2)
    })

    test('identity-sensitive methods should observe array length', () => {
        const value = reactive([1, 2, 3])

        let dummy
        effect(() => {
            dummy = value.indexOf(2)
        })

        expect(dummy).toBe(1)

        value.length = 1
        expect(dummy).toBe(-1)
    })

    test('mutation methods should trigger length dependency', () => {
        const value = reactive<number[]>([])

        let dummy
        effect(() => {
            dummy = value.join('')
        })
        expect(dummy).toEqual('')
        value.push(1)

        // copyWithin, fill, pop, push, reverse, shift, unshift, sort, splice
        expect(dummy).toEqual('1')
    })

    test('reverse should trigger index dependency', () => {
        const value = reactive([1, 2, 3])

        let dummy
        effect(() => {
            dummy = value[0]
        })
        expect(dummy).toEqual(1)
        value.reverse()

        expect(dummy).toEqual(3)
    })

    test('mutation methods should not observe array, which will cause dead loop', () => {
        const value = reactive<number[]>([])

        const fnSpy = jest.fn(() => {
            value.push(1)
        })
        effect(fnSpy)

        expect(fnSpy).toHaveBeenCalledTimes(1)
        value[0] = 3
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    test('reverse methods should not cause dead loop', () => {
        const value = reactive([1, 2, 3])

        effect(() => {
            value.reverse()
        })

        expect(value).toEqual([3, 2, 1])
    })

    test('should observe array non-integer prop like reactive object', () => {
        const value = reactive<{ test?: number } & number[]>([1, 2, 3])

        let dummy
        effect(() => {
            dummy = value['test']
        })

        expect(dummy).toBeUndefined()
        value['test'] = 1
        expect(dummy).toBe(1)
    })
})

describe('isReactive', () => {
    it('should return false for non-reactive object', () => {
        expect(isReactive({})).toBe(false)
    })

    it('should return true for reactive object', () => {
        expect(isReactive(reactive({}))).toBe(true)
    })

    it('should return true for object with reactive prototype', () => {
        const object = Object.create(reactive({}))

        expect(isReactive(object)).toBe(true)
    })
})

describe('toRaw', () => {
    it('should return corresponding raw object for reactive object', () => {
        const value = {}
        const rvalue = reactive(value)

        expect(toRaw(rvalue) === value).toBe(true)
    })

    it('should return same object for non-reactive object', () => {
        const value = {}

        expect(toRaw(value) === value).toBe(true)
    })

    it('should return same object for non-reactive object with a reactive prototype', () => {
        const value = {}
        const rvalue = reactive(value)
        const sub = Object.create(rvalue)

        expect(toRaw(sub) === sub).toBe(true)
    })
})

test('getTargetType should return target type for all three kinds of object', () => {
    const values = [
        [{}, TargetType.Common],
        [[], TargetType.Common],
        [new Map(), TargetType.Collection],
        [new WeakMap(), TargetType.Collection],
        [new Set(), TargetType.Collection],
        [new WeakSet(), TargetType.Collection],
        [null, TargetType.Invalid],
        [undefined, TargetType.Invalid],
        [1, TargetType.Invalid],
        [NaN, TargetType.Invalid],
        [0, TargetType.Invalid],
        [true, TargetType.Invalid],
        [false, TargetType.Invalid],
        ['hello', TargetType.Invalid],
        [Symbol(''), TargetType.Invalid],
    ] as const

    values.forEach(([value, type]) => {
        expect(getTargetType(value as any)).toBe(type)
    })
})
