import {
    reactive,
    effect,
    computed,
    isReactive,
    isRef,
    ref,
    type Ref,
    customRef,
    unref,
    toRef,
    toRefs,
    proxyRefs,
} from '../src'

const primitives = [
    null,
    undefined,
    1,
    0,
    -1,
    NaN,
    'text',
    true,
    false,
    Symbol('test'),
]
const objects = [{}, []]

describe('ref', () => {
    it('should hold primitive values', () => {
        primitives.forEach(value => {
            const r = ref(value)

            expect(r.value).toBe(value)
        })
    })

    it('should hold non primitive values', () => {
        objects.forEach(value => {
            const r = ref(value)

            expect(isReactive(r.value)).toBe(true)
        })
    })

    test('ref should be reactive', () => {
        const counter = ref(1)

        let dummy
        effect(() => {
            dummy = counter.value
        })

        expect(dummy).toEqual(1)
        counter.value++
        expect(dummy).toEqual(2)
    })

    it('should make nested properties reactive', () => {
        const data = ref({
            count: 1,
        })

        let dummy
        effect(() => {
            dummy = data.value.count
        })

        expect(dummy).toEqual(1)
        data.value.count++
        expect(dummy).toEqual(2)
    })

    it('should work without initial value', () => {
        const data = ref()

        let dummy
        effect(() => {
            dummy = data.value
        })

        expect(dummy).toBeUndefined()
        data.value = 1
        expect(dummy).toEqual(1)
    })

    it('should unwrap ref', () => {
        const a = ref(0)
        const b = ref(a)

        let dummy
        effect(() => {
            dummy = b.value
        })

        expect(dummy).toEqual(0)
        b.value = 1
        expect(dummy).toEqual(1)
    })

    it('should work like a normal property when nested in a reactive object', () => {
        const a = ref(1)
        const obj = reactive({
            a,
            b: {
                c: a,
            },
        })

        let dummy1: number
        let dummy2: number

        effect(() => {
            dummy1 = obj.a
            dummy2 = obj.b.c
        })

        const assertDummiesEqualTo = (val: number) =>
            [dummy1, dummy2].forEach(dummy => expect(dummy).toBe(val))

        assertDummiesEqualTo(1)
        a.value++
        assertDummiesEqualTo(2)
        obj.a++
        assertDummiesEqualTo(3)
        obj.b.c++
        assertDummiesEqualTo(4)
    })

    it('should unwrap nested values in types', () => {
        const a = {
            b: ref(0),
        }

        const c = ref(a)

        expect(typeof (c.value.b + 1)).toBe('number')
    })

    it('should NOT unwrap ref types nested inside arrays', () => {
        const arr = ref([1, ref(3)]).value
        expect(isRef(arr[0])).toBe(false)
        expect(isRef(arr[1])).toBe(true)
        expect((arr[1] as Ref).value).toBe(3)
    })

    it('should unwrap ref types as props of arrays', () => {
        const arr = [ref(0)]
        const symbolKey = Symbol('')
        arr['' as any] = ref(1)
        arr[symbolKey as any] = ref(2)
        const arrRef = ref(arr).value
        expect(isRef(arrRef[0])).toBe(true)
        expect(isRef(arrRef['' as any])).toBe(false)
        expect(isRef(arrRef[symbolKey as any])).toBe(false)
        expect(arrRef['' as any]).toBe(1)
        expect(arrRef[symbolKey as any]).toBe(2)
    })

    it('should keep tuple types', () => {
        const tuple: [
            number,
            string,
            { a: number },
            () => number,
            Ref<number>,
        ] = [0, '1', { a: 1 }, () => 0, ref(0)]
        const tupleRef = ref(tuple)

        tupleRef.value[0]++
        expect(tupleRef.value[0]).toBe(1)
        tupleRef.value[1] += '1'
        expect(tupleRef.value[1]).toBe('11')
        tupleRef.value[2].a++
        expect(tupleRef.value[2].a).toBe(2)
        expect(tupleRef.value[3]()).toBe(0)
        tupleRef.value[4].value++
        expect(tupleRef.value[4].value).toBe(1)
    })

    it('should keep symbols', () => {
        const customSymbol = Symbol()
        const obj = {
            [Symbol.asyncIterator]: ref(1),
            [Symbol.hasInstance]: { a: ref('a') },
            [Symbol.isConcatSpreadable]: { b: ref(true) },
            [Symbol.iterator]: [ref(1)],
            [Symbol.match]: new Set<Ref<number>>(),
            [Symbol.matchAll]: new Map<number, Ref<string>>(),
            [Symbol.replace]: { arr: [ref('a')] },
            [Symbol.search]: { set: new Set<Ref<number>>() },
            [Symbol.species]: { map: new Map<number, Ref<string>>() },
            [Symbol.split]: new WeakSet<Ref<boolean>>(),
            [Symbol.toPrimitive]: new WeakMap<Ref<boolean>, string>(),
            [Symbol.toStringTag]: { weakSet: new WeakSet<Ref<boolean>>() },
            [Symbol.unscopables]: {
                weakMap: new WeakMap<Ref<boolean>, string>(),
            },
            [customSymbol]: { arr: [ref(1)] },
        }

        const objRef = ref(obj)

        const keys: (keyof typeof obj)[] = [
            Symbol.asyncIterator,
            Symbol.hasInstance,
            Symbol.isConcatSpreadable,
            Symbol.iterator,
            Symbol.match,
            Symbol.matchAll,
            Symbol.replace,
            Symbol.search,
            Symbol.species,
            Symbol.split,
            Symbol.toPrimitive,
            Symbol.toStringTag,
            Symbol.unscopables,
            customSymbol,
        ]

        expect(objRef.value[customSymbol]).toStrictEqual(obj[customSymbol])

        keys.forEach(key => {
            expect(objRef.value[key]).toStrictEqual(obj[key])
        })
    })

    test('customRef', () => {
        let value = 1
        let _trigger: () => void

        const custom = customRef((track, trigger) => ({
            get() {
                track()
                return value
            },
            set(newValue: number) {
                value = newValue
                _trigger = trigger
            },
        }))

        expect(isRef(custom)).toBe(true)

        let dummy
        effect(() => {
            dummy = custom.value
        })
        expect(dummy).toBe(1)

        custom.value = 2
        // should not trigger yet
        expect(dummy).toBe(1)

        _trigger!()
        expect(dummy).toBe(2)
    })

    test('unref', () => {
        expect(unref(1)).toBe(1)
        expect(unref(ref(1))).toBe(1)
    })

    test('isRef', () => {
        expect(isRef(ref(1))).toBe(true)
        expect(isRef(computed(() => 1))).toBe(true)

        expect(isRef(0)).toBe(false)
        expect(isRef(1)).toBe(false)
        // an object that looks like a ref isn't necessarily a ref
        expect(isRef({ value: 0 })).toBe(false)
    })

    test('toRef', () => {
        const a = reactive({
            x: 1,
        })
        const x = toRef(a, 'x')
        expect(isRef(x)).toBe(true)
        expect(x.value).toBe(1)

        // source -> proxy
        a.x = 2
        expect(x.value).toBe(2)

        // proxy -> source
        x.value = 3
        expect(a.x).toBe(3)

        // reactivity
        let dummyX
        effect(() => {
            dummyX = x.value
        })
        expect(dummyX).toBe(x.value)

        // mutating source should trigger effect using the proxy refs
        a.x = 4
        expect(dummyX).toBe(4)

        // should keep ref
        const r = { x: ref(1) }
        expect(toRef(r, 'x')).toBe(r.x)
    })

    test('toRef default value', () => {
        const a: { x: number | undefined } = { x: undefined }
        const x = toRef(a, 'x', 1)
        expect(x.value).toBe(1)

        a.x = 2
        expect(x.value).toBe(2)

        a.x = undefined
        expect(x.value).toBe(1)
    })

    test('toRefs', () => {
        const a = reactive({
            x: 1,
            y: 2,
        })

        const { x, y } = toRefs(a)

        expect(isRef(x)).toBe(true)
        expect(isRef(y)).toBe(true)
        expect(x.value).toBe(1)
        expect(y.value).toBe(2)

        // source -> proxy
        a.x = 2
        a.y = 3
        expect(x.value).toBe(2)
        expect(y.value).toBe(3)

        // proxy -> source
        x.value = 3
        y.value = 4
        expect(a.x).toBe(3)
        expect(a.y).toBe(4)

        // reactivity
        let dummyX, dummyY
        effect(() => {
            dummyX = x.value
            dummyY = y.value
        })
        expect(dummyX).toBe(x.value)
        expect(dummyY).toBe(y.value)

        // mutating source should trigger effect using the proxy refs
        a.x = 4
        a.y = 5
        expect(dummyX).toBe(4)
        expect(dummyY).toBe(5)
    })

    test('toRefs should warn on plain object', () => {
        toRefs({})
        expect(`toRefs() expects a reactive object`).toHaveBeenWarned()
    })

    test('toRefs should warn on plain array', () => {
        toRefs([])
        expect(`toRefs() expects a reactive object`).toHaveBeenWarned()
    })

    test('toRefs reactive array', () => {
        const arr = reactive(['a', 'b', 'c'])
        const refs = toRefs(arr)

        expect(Array.isArray(refs)).toBe(true)

        refs[0].value = '1'
        expect(arr[0]).toBe('1')

        arr[1] = '2'
        expect(refs[1].value).toBe('2')
    })

    test('proxyRefs', () => {
        const objectWithRefs = {
            count: ref(1),
        }

        const proxy = proxyRefs(objectWithRefs)

        expect(proxy.count).toEqual(1)

        proxy.count = 2
    })
})

describe('isRef', () => {
    it('should differentiate ref and non-ref values', () => {
        const values = [...primitives, ...objects]

        values.forEach(value => {
            expect(isRef(value)).toEqual(false)
            expect(isRef(ref(value))).toEqual(true)
        })
    })
})
