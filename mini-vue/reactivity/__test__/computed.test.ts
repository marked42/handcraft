import { effect, reactive } from '../src'
import { computed } from '../src/computed'

describe('computed', () => {
    it('is lazy evaluated and cached', () => {
        const numbers = reactive({
            left: 1,
            right: 1,
        })

        const spy = jest.fn(() => numbers.left + numbers.right)
        const sum = computed(spy)

        expect(spy).toHaveBeenCalledTimes(0)

        expect(sum.value).toEqual(2)
        expect(spy).toHaveBeenCalledTimes(1)
        expect(sum.value).toEqual(2)
        expect(spy).toHaveBeenCalledTimes(1)

        numbers.left = 2
        expect(spy).toHaveBeenCalledTimes(1)
        numbers.left = 3
        expect(spy).toHaveBeenCalledTimes(1)

        numbers.right = 2
        expect(spy).toHaveBeenCalledTimes(1)
        numbers.right = 3
        expect(spy).toHaveBeenCalledTimes(1)

        expect(sum.value).toEqual(6)
        expect(spy).toHaveBeenCalledTimes(2)
        expect(sum.value).toEqual(6)
        expect(spy).toHaveBeenCalledTimes(2)
    })

    test('should be reactive', () => {
        const numbers = reactive({
            left: 1,
            right: 1,
        })

        const sum = computed(() => numbers.left + numbers.right)

        let dummy
        effect(() => {
            dummy = sum.value
        })

        expect(dummy).toEqual(2)

        numbers.left = 2
        expect(dummy).toEqual(3)
    })

    test('nested computed', () => {
        const numbers = reactive({
            left: 1,
            right: 1,
            power: 2,
        })

        const sum = computed(() => numbers.left + numbers.right)

        const squareSum = computed(() => Math.pow(sum.value, numbers.power))

        let dummy
        effect(() => {
            dummy = squareSum.value
        })

        expect(dummy).toEqual(4)

        numbers.left = 2
        expect(dummy).toEqual(9)

        numbers.right = 2
        expect(dummy).toEqual(16)

        numbers.power = 3
        expect(dummy).toEqual(64)
    })
})
