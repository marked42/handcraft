import { isReactive, reactive, toRaw } from '../../src'
import { effect } from '../../src/effects'

it('should return reactive Map', () => {
    const map = new Map()
    const reactiveMap = reactive(new Map())

    expect(isReactive(map)).toBe(false)
    expect(isReactive(reactiveMap)).toBe(true)

    expect(map instanceof Map).toBe(true)
    expect(reactiveMap instanceof Map).toBe(true)
})

it('should observe mutations', () => {
    const map = reactive(new Map())

    let dummy
    effect(() => {
        dummy = map.get('key')
    })

    expect(dummy).toBe(undefined)

    map.set('key', 1)
    expect(dummy).toBe(1)

    map.set('key', 2)
    expect(dummy).toBe(2)

    map.delete('key')
    expect(dummy).toBe(undefined)
})

it('should observe has operation', () => {
    const map = reactive(new Map())

    let dummy
    effect(() => {
        dummy = map.has('key')
    })

    expect(dummy).toBe(false)

    map.set('key', 1)
    expect(dummy).toBe(true)

    map.delete('key')
    expect(dummy).toBe(false)
})

test('add new value triggers size change', () => {
    const map = reactive(new Map())

    let dummy
    effect(() => {
        dummy = map.size
    })

    expect(dummy).toEqual(0)

    map.set('name', 'tom')
    expect(dummy).toEqual(1)
})

test('update value does not trigger size change', () => {
    const map = reactive(new Map([['name', 'tom']]))

    const fnSpy = jest.fn(() => {
        dummy = map.size
    })
    let dummy
    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(1)

    map.set('name', 'tom')
    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(1)
})

test('delete existing value triggers size change', () => {
    const map = reactive(new Map([['name', 'tom']]))

    let dummy
    effect(() => {
        dummy = map.size
    })

    expect(dummy).toEqual(1)

    map.delete('name')
    expect(dummy).toEqual(0)
})

test('delete non-existing value does not trigger size change', () => {
    const map = reactive(new Map([['name', 'tom']]))

    let dummy
    const fnSpy = jest.fn(() => {
        dummy = map.size
    })

    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(1)

    map.delete('non-existing')

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(1)
})

test('add new value triggers keys change', () => {
    const map = reactive(new Map())

    let dummy
    effect(() => {
        dummy = [...map.keys()]
    })

    expect(dummy).toEqual([])

    map.set('name', 'tom')
    expect(dummy).toEqual(['name'])
})

test('update value does not trigger keys change', () => {
    const map = reactive(new Map([['name', 'tom']]))

    const fnSpy = jest.fn(() => {
        dummy = [...map.keys()]
    })
    let dummy
    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(['name'])

    map.set('name', 'tom')
    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(['name'])
})

test('delete existing value triggers keys change', () => {
    const map = reactive(new Map([['name', 'tom']]))

    let dummy
    effect(() => {
        dummy = [...map.keys()]
    })

    expect(dummy).toEqual(['name'])

    map.delete('name')
    expect(dummy).toEqual([])
})

test('delete non-existing value does not trigger keys change', () => {
    const map = reactive(new Map([['name', 'tom']]))

    let dummy
    const fnSpy = jest.fn(() => {
        dummy = [...map.keys()]
    })

    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(['name'])

    map.delete('non-existing')

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual(['name'])
})

test('add new value triggers values change', () => {
    const map = reactive(new Map([[1, 2]]))

    let dummy
    effect(() => {
        dummy = [...map.values()]
    })

    expect(dummy).toEqual([2])

    map.set(3, 4)
    expect(dummy).toEqual([2, 4])
})

test('set value triggers values change', () => {
    const map = reactive(new Map([[1, 2]]))

    let dummy
    effect(() => {
        dummy = [...map.values()]
    })

    expect(dummy).toEqual([2])

    map.set(1, 3)
    expect(dummy).toEqual([3])
})

test('delete existing value triggers values change', () => {
    const map = reactive(new Map([[1, 2]]))

    let dummy
    effect(() => {
        dummy = [...map.values()]
    })

    expect(dummy).toEqual([2])

    map.delete(1)
    expect(dummy).toEqual([])
})

test('delete non-exist value should not trigger values change', () => {
    const map = reactive(new Map([[1, 2]]))

    let dummy
    const fnSpy = jest.fn(() => {
        dummy = [...map.values()]
    })
    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual([2])

    // non-exist
    map.delete(3)
    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual([2])
})

test('should observe entries iteration', () => {
    const map = reactive(new Map<number | string, number | string>([[1, 2]]))

    let dummy
    const fnSpy = jest.fn(() => {
        dummy = []
        for (const [, value] of map.entries()) {
            dummy.push(value)
        }
    })
    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual([2])

    // add
    map.set('name', 'tom')
    expect(dummy).toEqual([2, 'tom'])

    // set
    map.set('name', 'jerry')
    expect(dummy).toEqual([2, 'jerry'])

    // delete
    map.delete('name')
    expect(dummy).toEqual([2])

    // delete non-exist
    map.delete('non-exist')
    expect(dummy).toEqual([2])
})

test('should observe forEach iteration', () => {
    const map = reactive(new Map<number | string, number | string>([[1, 2]]))

    let dummy
    const fnSpy = jest.fn(() => {
        dummy = []
        map.forEach(value => {
            dummy.push(value)
        })
    })
    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual([2])

    // add
    map.set('name', 'tom')
    expect(dummy).toEqual([2, 'tom'])

    // set
    map.set('name', 'jerry')
    expect(dummy).toEqual([2, 'jerry'])

    // delete
    map.delete('name')
    expect(dummy).toEqual([2])

    // delete non-exist
    map.delete('non-exist')
    expect(dummy).toEqual([2])
})

test('should observe for-of iteration', () => {
    const map = reactive(new Map<number | string, number | string>([[1, 2]]))

    let dummy
    const fnSpy = jest.fn(() => {
        dummy = []
        for (const [, value] of map) {
            dummy.push(value)
        }
    })
    effect(fnSpy)

    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(dummy).toEqual([2])

    // add
    map.set('name', 'tom')
    expect(dummy).toEqual([2, 'tom'])

    // set
    map.set('name', 'jerry')
    expect(dummy).toEqual([2, 'jerry'])

    // delete
    map.delete('name')
    expect(dummy).toEqual([2])

    // delete non-exist
    map.delete('non-exist')
    expect(dummy).toEqual([2])
})

test('clear should trigger size change', () => {
    const map = reactive(new Map().set(1, 2))

    let dummy
    effect(() => {
        dummy = map.size
    })

    expect(dummy).toEqual(1)

    map.clear()
    expect(dummy).toEqual(0)
})

test('clear should trigger keys change', () => {
    const map = reactive(new Map([[1, 2]]))

    let dummy
    effect(() => {
        dummy = [...map.keys()]
    })

    expect(dummy).toEqual([1])

    map.clear()
    expect(dummy).toEqual([])
})

test('clear should trigger values change', () => {
    const map = reactive(new Map([[1, 2]]))

    let dummy
    effect(() => {
        dummy = [...map.values()]
    })

    expect(dummy).toEqual([2])

    map.clear()
    expect(dummy).toEqual([])
})

test('clear should trigger each key change', () => {
    const map = reactive(
        new Map([
            [1, 2],
            [3, 4],
        ]),
    )

    let dummy1
    effect(() => {
        dummy1 = map.get(1)
    })
    let dummy2
    effect(() => {
        dummy2 = map.get(3)
    })

    expect(dummy1).toEqual(2)
    expect(dummy2).toEqual(4)

    map.clear()
    expect(dummy1).toBeUndefined()
    expect(dummy2).toBeUndefined()
})

it('should not observe custom property mutations', () => {
    let dummy
    const map: any = reactive(new Map())
    effect(() => (dummy = map.customProp))

    expect(dummy).toBe(undefined)
    map.customProp = 'Hello World'
    expect(dummy).toBe(undefined)
})

it('should not observe non value changing mutations', () => {
    let dummy
    const map = reactive(new Map())
    const mapSpy = jest.fn(() => (dummy = map.get('key')))
    effect(mapSpy)

    expect(dummy).toBe(undefined)
    expect(mapSpy).toHaveBeenCalledTimes(1)
    map.set('key', 'value')
    expect(dummy).toBe('value')
    expect(mapSpy).toHaveBeenCalledTimes(2)
    map.set('key', 'value')
    expect(dummy).toBe('value')
    expect(mapSpy).toHaveBeenCalledTimes(2)
    map.delete('key')
    expect(dummy).toBe(undefined)
    expect(mapSpy).toHaveBeenCalledTimes(3)
    map.delete('key')
    expect(dummy).toBe(undefined)
    expect(mapSpy).toHaveBeenCalledTimes(3)
    map.clear()
    expect(dummy).toBe(undefined)
    expect(mapSpy).toHaveBeenCalledTimes(3)
})

it('should not pollute original Map with Proxies', () => {
    const map = new Map()
    const observed = reactive(map)
    const value = reactive({})
    observed.set('key', value)
    expect(map.get('key')).not.toBe(value)
    expect(map.get('key')).toBe(toRaw(value))
})

it('should return observable versions of contained values', () => {
    const observed = reactive(new Map())
    const value = {}
    observed.set('key', value)
    const wrapped = observed.get('key')
    expect(isReactive(wrapped)).toBe(true)
    expect(toRaw(wrapped)).toBe(value)
})

it('should observed nested data', () => {
    const observed = reactive(new Map())
    observed.set('key', { a: 1 })
    let dummy
    effect(() => {
        dummy = observed.get('key').a
    })
    observed.get('key').a = 2
    expect(dummy).toBe(2)
})

it('should observe nested values in iterations (forEach)', () => {
    const map = reactive(new Map([[1, { foo: 1 }]]))
    let dummy: any
    effect(() => {
        dummy = 0
        map.forEach(value => {
            expect(isReactive(value)).toBe(true)
            dummy += value.foo
        })
    })
    expect(dummy).toBe(1)
    map.get(1)!.foo++
    expect(dummy).toBe(2)
})

it('should observe nested values in iterations (values)', () => {
    const map = reactive(new Map([[1, { foo: 1 }]]))
    let dummy: any
    effect(() => {
        dummy = 0
        for (const value of map.values()) {
            expect(isReactive(value)).toBe(true)
            dummy += value.foo
        }
    })
    expect(dummy).toBe(1)
    map.get(1)!.foo++
    expect(dummy).toBe(2)
})

it('should observe nested values in iterations (entries)', () => {
    const key = {}
    const map = reactive(new Map([[key, { foo: 1 }]]))
    let dummy: any
    effect(() => {
        dummy = 0
        for (const [key, value] of map.entries()) {
            key
            expect(isReactive(key)).toBe(true)
            expect(isReactive(value)).toBe(true)
            dummy += value.foo
        }
    })
    expect(dummy).toBe(1)
    map.get(key)!.foo++
    expect(dummy).toBe(2)
})

it('should not be trigger when the value and the old value both are NaN', () => {
    const map = reactive(new Map([['foo', NaN]]))
    const mapSpy = jest.fn(() => map.get('foo'))
    effect(mapSpy)
    map.set('foo', NaN)
    expect(mapSpy).toHaveBeenCalledTimes(1)
})

it('should work with reactive keys in raw map', () => {
    const raw = new Map()
    const key = reactive({})
    raw.set(key, 1)
    const map = reactive(raw)

    expect(map.has(key)).toBe(true)
    expect(map.get(key)).toBe(1)

    expect(map.delete(key)).toBe(true)
    expect(map.has(key)).toBe(false)
    expect(map.get(key)).toBeUndefined()
})

it('should track set of reactive keys in raw map', () => {
    const raw = new Map()
    const key = reactive({})
    raw.set(key, 1)
    const map = reactive(raw)

    let dummy
    effect(() => {
        dummy = map.get(key)
    })
    expect(dummy).toBe(1)

    map.set(key, 2)
    expect(dummy).toBe(2)
})

it('should track deletion of reactive keys in raw map', () => {
    const raw = new Map()
    const key = reactive({})
    raw.set(key, 1)
    const map = reactive(raw)

    let dummy
    effect(() => {
        dummy = map.has(key)
    })
    expect(dummy).toBe(true)

    map.delete(key)
    expect(dummy).toBe(false)
})

it('should not trigger key iteration when setting existing keys', () => {
    const map = reactive(new Map())
    const spy = jest.fn()

    effect(() => {
        const keys = []
        for (const key of map.keys()) {
            keys.push(key)
        }
        spy(keys)
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toMatchObject([])

    map.set('a', 0)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy.mock.calls[1][0]).toMatchObject(['a'])

    map.set('b', 0)
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy.mock.calls[2][0]).toMatchObject(['a', 'b'])

    // keys didn't change, should not trigger
    map.set('b', 1)
    expect(spy).toHaveBeenCalledTimes(3)
})

it('should return proxy from Map.set call', () => {
    const map = reactive(new Map())
    const result = map.set('a', 'a')
    expect(result).toBe(map)
})
