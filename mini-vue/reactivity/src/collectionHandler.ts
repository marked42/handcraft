import {
    MAP_KEY_ITERATE_KEY,
    track,
    TriggerOpType,
    trigger,
    ITERATE_KEY,
} from './effects'
import { reactive, ReactiveFlag, toRaw } from './reactive'
import { hasChanged, hasOwn, isMap, Key } from './utils'
import type { MapTypes, IterableCollection, CollectionTypes } from './utils'

function collectionHasKey(collection: CollectionTypes, key: any) {
    const target = toRaw(collection)

    if (target.has(key)) {
        return {
            has: true,
            key,
        }
    }

    const rawKey = toRaw(key)
    if (target.has(rawKey)) {
        return { has: true, key: rawKey }
    }

    return { has: false, key }
}

function get(this: MapTypes, key: any) {
    const target = toRaw(this)

    const rawKey = toRaw(key)
    track(target, rawKey)

    const result = collectionHasKey(this, key)
    if (result.has) {
        return reactive(target.get(result.key))
    }
}

function has(this: MapTypes, key: any) {
    const target = toRaw(this)

    const rawKey = toRaw(key)
    track(target, rawKey)

    return collectionHasKey(this, key).has
}

function size(this: IterableCollection) {
    const target = toRaw(this)
    track(target, ITERATE_KEY)
    return target.size
}

function forEach(this: IterableCollection, callback: any, thisArg: any) {
    const target = toRaw(this)

    track(target, ITERATE_KEY)

    return target.forEach((value, key) => {
        return callback.call(thisArg, reactive(value), key, this)
    })
}

function add(this: Set<any>, value: any) {
    const { has: hasValue } = collectionHasKey(this, value)

    if (!hasValue) {
        const target = toRaw(this)
        const rawValue = toRaw(value)

        target.add(rawValue)
        trigger(target, TriggerOpType.ADD, rawValue)
    }

    return this
}

function set(this: MapTypes, key: any, value: any) {
    const target = toRaw(this)

    const oldValue = target.get(key)

    const rawKey = toRaw(key)
    const rawValue = toRaw(value)

    const result = collectionHasKey(this, key)

    // set existing reactive key
    target.set(result.key, rawValue)
    if (!result.has) {
        // add new value
        trigger(target, TriggerOpType.ADD, rawKey, rawValue)
    } else if (hasChanged(rawValue, oldValue)) {
        trigger(target, TriggerOpType.SET, rawKey, rawValue, oldValue)
    }

    return this
}

function deleteEntry(this: CollectionTypes, key: any) {
    const result = collectionHasKey(this, key)
    if (!result.has) {
        return false
    }

    ;({ key } = result)

    const target = toRaw(this)
    // set doesn't has get method, use undefined as old value
    const oldValue = isMap(target) ? target.get(key) : undefined
    target.delete(key)
    const rawKey = toRaw(key)
    trigger(target, TriggerOpType.DELETE, rawKey, undefined, oldValue)
    return true
}

function clear(this: IterableCollection) {
    const target = toRaw(this)

    const hadItems = target.size > 0
    const result = target.clear()
    if (hadItems) {
        trigger(target, TriggerOpType.CLEAR)
    }
    return result
}

function createIterableMethod(method: Key) {
    return function iterable(this: IterableCollection, ...args: unknown[]) {
        const rawTarget = toRaw(this)

        const iterator = (rawTarget as any)[method](...args)

        const keysOnly = method === 'keys' && isMap(rawTarget)
        if (keysOnly) {
            track(rawTarget, MAP_KEY_ITERATE_KEY)
        } else {
            track(rawTarget, ITERATE_KEY)
        }

        const isPair =
            method === 'entries' ||
            (method === Symbol.iterator && isMap(rawTarget))
        const wrap = reactive

        const iterableIterator = {
            next() {
                const { done, value } = iterator.next()

                return {
                    done,
                    value:
                        Array.isArray(value) && isPair
                            ? [wrap(value[0]), wrap(value[1])]
                            : wrap(value),
                }
            },
            [Symbol.iterator]() {
                return this
            },
        }

        return iterableIterator
    }
}

function createInstrumentations() {
    const instrumentations: Record<Key, Function | number> = {
        has,
        get,
        set,
        delete: deleteEntry,
        forEach,
        clear,
        add,
        get size() {
            return size.call(this as unknown as IterableCollection)
        },
    }

    const iterableMethods = ['keys', 'values', 'entries', Symbol.iterator]
    iterableMethods.forEach(method => {
        instrumentations[method] = createIterableMethod(method)
    })

    return instrumentations
}

const instrumentations = createInstrumentations()

export const collectionHandlers = {
    get(target: MapTypes, prop: Key, receiver: object) {
        if (prop === ReactiveFlag.Reactive) {
            return true
        } else if (prop === ReactiveFlag.RAW) {
            return target
        }

        const isInstanceMethod =
            hasOwn(instrumentations, prop) && prop in target

        return Reflect.get(
            isInstanceMethod ? instrumentations : target,
            prop,
            receiver,
        )
    },
}
