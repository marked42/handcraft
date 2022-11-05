import { reactive, effect } from '../src'

describe('effect', () => {
    it('should run passed function once', () => {
        const value = { name: 'tom' }
        const observed = reactive(value)

        const fnSpy = jest.fn(() => {
            observed.name
        })

        expect(fnSpy).toHaveBeenCalledTimes(0)
        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    it('should observe single property', () => {
        const observed = reactive({ name: 'tom' })

        let dummy
        const fnSpy = jest.fn(() => {
            dummy = observed.name
        })

        effect(fnSpy)
        expect(dummy).toBe('tom')

        observed.name = 'jerry'
        expect(dummy).toBe('jerry')
    })

    it('should observe multiple properties', () => {
        const observed = reactive({ name: 'tom', age: 3 })

        let dummy, dummy2
        const fnSpy = jest.fn(() => {
            dummy = observed.name
            dummy2 = observed.age
        })

        effect(fnSpy)
        expect(dummy).toBe('tom')
        expect(dummy2).toBe(3)

        observed.name = 'jerry'
        expect(dummy).toBe('jerry')

        observed.age = 4
        expect(dummy2).toBe(4)
    })

    it('should handle multiple effects', () => {
        const observed = reactive({ name: 'tom' })

        let dummy
        const fnSpy1 = jest.fn(() => {
            dummy = observed.name
        })

        let dummy2
        const fnSpy2 = jest.fn(() => {
            dummy2 = observed.name
        })

        effect(fnSpy1)
        expect(dummy).toBe('tom')
        effect(fnSpy2)
        expect(dummy2).toBe('tom')

        observed.name = 'jerry'
        expect(dummy).toBe('jerry')
        expect(dummy2).toBe('jerry')
    })

    it('should observe nested properties', () => {
        const observed = reactive({
            tom: {
                age: 3,
            },
        })

        let dummy
        const fnSpy = jest.fn(() => {
            dummy = observed.tom.age
        })

        effect(fnSpy)
        observed.tom.age = 4
        expect(dummy).toBe(4)
    })

    test('delete operation should trigger effect', () => {
        const observed = reactive<{ name?: string }>({ name: 'tom' })

        let dummy
        effect(() => {
            dummy = observed.name
        })

        expect(dummy).toBe('tom')

        delete observed.name
        expect(dummy).toBeUndefined()
    })

    test('add operation should trigger effect', () => {
        const observed = reactive<{ name?: string }>({})

        let dummy
        effect(() => {
            dummy = observed.name
        })

        expect(dummy).toBeUndefined()

        observed.name = 'tom'
        expect(dummy).toBe('tom')
    })

    it('should observe has operation', () => {
        const observed = reactive<{ name?: string }>({ name: 'tom' })

        let dummy
        effect(() => {
            dummy = 'name' in observed
        })

        expect(dummy).toBe(true)

        delete observed.name
        expect(dummy).toBe(false)

        observed.name = 'jerry'
        expect(dummy).toBe(true)
    })

    it('should observe enumerate operation (Object.keys) on object', () => {
        const observed = reactive<{ name?: string; age?: number }>({
            name: 'tom',
        })

        let dummy
        effect(() => {
            dummy = Object.keys(observed)
        })

        expect(dummy).toEqual(['name'])

        // prop addition
        observed.age = 4
        expect(dummy).toEqual(['name', 'age'])

        // prop deletion
        delete observed.name
        expect(dummy).toEqual(['age'])
    })

    it('should observe enumerate operation (for-in) on object', () => {
        const observed = reactive<{ name?: string; age?: number }>({
            name: 'tom',
        })

        let dummy
        effect(() => {
            dummy = []
            for (let key in observed) {
                dummy.push(key)
            }
        })

        expect(dummy).toEqual(['name'])

        // prop addition
        observed.age = 4
        expect(dummy).toEqual(['name', 'age'])

        // prop deletion
        delete observed.name
        expect(dummy).toEqual(['age'])
    })

    test('nested effect', () => {
        const obj = reactive({ inner: 1, outer: 10 })

        let inner
        let outer

        const innerSpy = jest.fn(() => {
            inner = obj.inner
        })
        const outerSpy = jest.fn(() => {
            outer = obj.outer
            effect(innerSpy)
        })

        effect(outerSpy)

        expect(inner).toEqual(1)
        expect(outer).toEqual(10)
        expect(innerSpy).toHaveBeenCalledTimes(1)
        expect(outerSpy).toHaveBeenCalledTimes(1)

        obj.inner = 2
        expect(inner).toEqual(2)
        expect(outer).toEqual(10)
        expect(innerSpy).toHaveBeenCalledTimes(2)
        expect(outerSpy).toHaveBeenCalledTimes(1)

        obj.outer = 12
        expect(inner).toEqual(2)
        expect(outer).toEqual(12)
        expect(innerSpy).toHaveBeenCalledTimes(3)
        expect(outerSpy).toHaveBeenCalledTimes(2)
    })

    it('should discover new branches while running automatically', () => {
        let dummy
        const obj = reactive({ prop: 'value', run: false })

        const conditionalSpy = jest.fn(() => {
            dummy = obj.run ? obj.prop : 'other'
        })
        effect(conditionalSpy)

        expect(dummy).toBe('other')
        expect(conditionalSpy).toHaveBeenCalledTimes(1)
        obj.prop = 'Hi'
        expect(dummy).toBe('other')
        expect(conditionalSpy).toHaveBeenCalledTimes(1)
        obj.run = true
        expect(dummy).toBe('Hi')
        expect(conditionalSpy).toHaveBeenCalledTimes(2)
        obj.prop = 'World'
        expect(dummy).toBe('World')
        expect(conditionalSpy).toHaveBeenCalledTimes(3)
    })

    it('should discover new branches when running manually', () => {
        let dummy
        let run = false
        const obj = reactive({ prop: 'value' })
        const runner = effect(() => {
            dummy = run ? obj.prop : 'other'
        })

        expect(dummy).toBe('other')
        runner()
        expect(dummy).toBe('other')
        run = true
        runner()
        expect(dummy).toBe('value')
        obj.prop = 'World'
        expect(dummy).toBe('World')
    })

    it('should not be triggered by mutating a property, which is used in an inactive branch', () => {
        let dummy
        const obj = reactive({ prop: 'value', run: true })

        const conditionalSpy = jest.fn(() => {
            dummy = obj.run ? obj.prop : 'other'
        })
        effect(conditionalSpy)

        expect(dummy).toBe('value')
        expect(conditionalSpy).toHaveBeenCalledTimes(1)
        obj.run = false
        expect(dummy).toBe('other')
        expect(conditionalSpy).toHaveBeenCalledTimes(2)
        obj.prop = 'value2'
        expect(dummy).toBe('other')
        expect(conditionalSpy).toHaveBeenCalledTimes(2)
    })

    test('lazy effect', () => {
        let dummy = 0
        const spy = jest.fn(() => {
            dummy = 1
        })
        effect(spy, { lazy: true })

        expect(dummy).toEqual(0)
        expect(spy).not.toHaveBeenCalled()
    })

    test('scheduler effect', () => {
        let dummy = 0
        const spy = jest.fn(() => {
            dummy = 1
        })
        effect(spy, {
            scheduler() {
                dummy = 2
            },
        })

        expect(dummy).toEqual(1)
    })
})
