import { isArray } from 'util'
import { track, trigger, TriggerOpType } from './effects'
import { isReactive, reactive, toRaw } from './reactive'
import type { CollectionTypes } from './utils'

export type UnwrapNestedRefs<T> = T extends CollectionTypes
    ? T
    : T extends Array<any>
    ? T
    : T extends Ref
    ? UnwrapSingleRefs<T>
    : UnwrapObjectRefs<T>

export type UnwrapSingleRefs<T> = T extends Ref<infer U>
    ? UnwrapSingleRefs<U>
    : T

export type UnwrapObjectRefs<T> = T extends Ref<infer U>
    ? U
    : // 对于symbol类型的key不进行unwrap
      { [K in keyof T]: K extends symbol ? T[K] : UnwrapObjectRefs<T[K]> }

export function ref<T>(): Ref<T>
export function ref<T>(value: T): Ref<UnwrapNestedRefs<T>>
export function ref(value?: any) {
    if (isRef(value)) {
        return value
    }

    return new RefImpl(value)
}

export interface Ref<T = any> {
    value: T
}

class RefImpl<T> {
    _value: T

    get __is_ref() {
        return true
    }

    constructor(value?: T) {
        const rawValue = toRaw(value)
        // @ts-ignore
        this._value = reactive(rawValue)
    }

    get value() {
        track(this, 'value')
        return this._value
    }

    set value(newValue: T) {
        const oldValue = toRaw(this._value)

        const rawValue = toRaw(newValue)
        // @ts-ignore
        this._value = reactive(rawValue)

        trigger(this, TriggerOpType.SET, 'value', rawValue, oldValue)
    }
}

export function isRef(value: any): value is Ref {
    return !!(value && (value as any)['__is_ref'])
}

interface CustomRefFactory<T> {
    (track: () => void, trigger: () => void): {
        get: () => T
        set: (val: T) => void
    }
}

export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
    return new CustomRefImpl(factory)
}

class CustomRefImpl<T> {
    private readonly _get: ReturnType<CustomRefFactory<T>>['get']
    private readonly _set: ReturnType<CustomRefFactory<T>>['set']

    get __is_ref() {
        return true
    }

    constructor(factory: CustomRefFactory<T>) {
        const { get, set } = factory(
            () => {
                track(this, 'value')
            },
            () => {
                trigger(this, TriggerOpType.SET, 'value')
            },
        )

        this._get = get
        this._set = set
    }

    get value() {
        return this._get()
    }

    set value(val: T) {
        this._set(val)
    }
}

export function unref<T>(val: Ref<T> | T) {
    return isRef(val) ? val.value : val
}

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type ToRef<T> = IfAny<T, Ref<T>, [T] extends [Ref] ? T : Ref<T>>

export function toRef<T extends object, K extends keyof T>(
    obj: T,
    key: K,
    fallback: T[K],
): ToRef<T[K]>
export function toRef<T extends object, K extends keyof T>(
    obj: T,
    key: K,
): ToRef<Exclude<T[K], undefined>>

export function toRef<T extends object, K extends keyof T>(
    obj: T,
    key: K,
    fallback?: T[K],
): ToRef<T[K]> {
    const value = obj[key]
    if (isRef(value)) {
        return value
    }

    // objectRef 如何确定推断出类型的？ { value: T[K] }
    const objectRef = {
        get value() {
            const value = obj[key]
            if (typeof value === 'undefined') {
                // TODO: T[K] 应该包含了 undefined 类型，所以这里不应该报错
                return fallback as T[K]
            }
            return obj[key]
        },
        set value(val: T[K]) {
            obj[key] = val
        },
    }

    Object.defineProperty(objectRef, '__is_ref', {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
    })

    return objectRef as any
}

type ToRefs<T> = {
    [K in keyof T]: ToRef<T[K]>
}

export function toRefs<T extends object>(val: T): ToRefs<T> {
    if (!isReactive(val)) {
        console.warn('toRefs() expects a reactive object')
    }

    const proxy: any = Array.isArray(val) ? new Array(val.length) : {}

    for (const key in val) {
        proxy[key] = toRef(val, key)
    }

    return proxy
}

/**
 * Reactive对象会自动脱ref，但是原始对象，属性值是ref的情况不会
 *
 * 使用proxyRefs处理这种情况
 */
export function proxyRefs<T extends object>(value: T): UnwrapObjectRefs<T> {
    return isReactive(value)
        ? (value as any)
        : new Proxy(value, {
              get(target, p, receiver) {
                  return unref(Reflect.get(target, p, receiver))
              },
              set(target, p, newValue, receiver) {
                  const value = Reflect.get(target, p, receiver)

                  if (isRef(value) && !isRef(newValue)) {
                      value.value = newValue
                      return true
                  } else {
                      return Reflect.set(target, p, newValue, reactive)
                  }
              },
          })
}
