import {
    ITERATE_KEY,
    pauseTracking,
    resetTracking,
    track,
    TriggerOpType,
    trigger,
} from './effects'
import { reactiveMap, reactive, ReactiveFlag, Target, toRaw } from './reactive'
import {
    Key,
    isObject,
    hasChanged,
    isSymbol,
    builtInSymbols,
    isIntegerKey,
    hasOwn,
} from './utils'
import { isRef } from './ref'

function ownKeys(target: object) {
    track(target, Array.isArray(target) ? 'length' : ITERATE_KEY)

    return Reflect.ownKeys(target)
}

function createArrayInstrumentations() {
    const instrumentations: Record<string, Function> = {}
    const identitySensitiveMethods = ['indexOf', 'includes', 'lastIndexOf']
    identitySensitiveMethods.forEach(method => {
        instrumentations[method] = function (this: any, ...args: any[]) {
            const array = toRaw(this)

            const length = array.length
            for (let i = 0; i < length; i++) {
                // 数组的下标转换为string类型
                track(array, String(i))
            }
            track(array, 'length')

            const result = array[method](...args)
            if (result === -1 || result === false) {
                return array[method](...args.map(toRaw))
            } else {
                return result
            }
        }
    })

    const mutationMethods = [
        'copyWithin',
        'fill',
        'pop',
        'push',
        'reverse',
        'shift',
        'unshift',
        'sort',
        'splice',
    ]
    mutationMethods.forEach(method => {
        instrumentations[method] = function (this: any, ...args: any[]) {
            const array = toRaw(this)
            pauseTracking()
            // use reactive array as this so it can triggers change
            const result = array[method].call(this, ...args)
            resetTracking()

            return result
        }
    })

    return instrumentations
}

const arrayInstrumentations = createArrayInstrumentations()

function get(target: Target, prop: Key, receiver: object): any {
    if (prop === ReactiveFlag.Reactive) {
        return true
    } else if (
        prop === ReactiveFlag.RAW &&
        // receiver is exactly proxy
        receiver === reactiveMap.get(target)
    ) {
        return target
    }

    const value = Reflect.get(target, prop, receiver)

    if (isSymbol(prop) && builtInSymbols.has(prop)) {
        return value
    }

    track(target, prop)

    const isArray = Array.isArray(target)
    if (
        isArray &&
        typeof prop === 'string' &&
        hasOwn(arrayInstrumentations, prop)
    ) {
        return Reflect.get(arrayInstrumentations, prop, receiver)
    }

    if (isRef(value)) {
        // skip ref unwrapping for Array + integer key
        return isArray && isIntegerKey(prop) ? value : value.value
    }

    if (isObject(value)) {
        return reactive(value)
    }

    return value
}

function set(target: Target, prop: Key, newValue: unknown, receiver: object) {
    const oldValue = Reflect.get(target, prop, receiver)

    const hasKey =
        Array.isArray(target) && isIntegerKey(prop as any)
            ? Number(prop) < target.length
            : Reflect.has(target, prop)

    // ref unwrapping
    if (isRef(oldValue) && !isRef(newValue)) {
        oldValue.value = newValue
        return true
    }

    const result = Reflect.set(target, prop, newValue, receiver)
    if (!hasKey) {
        trigger(target, TriggerOpType.ADD, prop, newValue, undefined)
    } else if (hasChanged(newValue, oldValue)) {
        trigger(target, TriggerOpType.SET, prop, newValue, oldValue)
    }

    return result
}

function deleteProperty(target: object, prop: Key) {
    const hasKey = Reflect.has(target, prop)
    // 默认删除成功
    const deleted = Reflect.deleteProperty(target, prop)
    if (hasKey) {
        trigger(target, TriggerOpType.DELETE, prop)
    }

    return deleted
}

function has(target: object, p: Key) {
    track(target, p)
    return Reflect.has(target, p)
}

export const mutableHandlers = {
    has,
    get,
    set,
    deleteProperty,
    ownKeys,
}
