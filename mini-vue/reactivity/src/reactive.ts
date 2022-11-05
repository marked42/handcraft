import { getObjectType, isObject } from './utils'
import { mutableHandlers } from './baseHandler'
import { collectionHandlers } from './collectionHandler'
import type { UnwrapNestedRefs } from './ref'

export const reactiveMap = new Map()

export function reactive<T extends object>(value: T): UnwrapNestedRefs<T> {
    return createReactiveObject(value)
}

function createReactiveObject(value: object) {
    if (!isObject(value)) {
        return value
    }

    const type = getTargetType(value)
    if (type === TargetType.Invalid) {
        return value
    }

    if (isReactive(value)) {
        return value
    }

    if (reactiveMap.has(value)) {
        return reactiveMap.get(value)
    }

    const proxy = new Proxy(
        value,
        type === TargetType.Collection ? collectionHandlers : mutableHandlers,
    )

    reactiveMap.set(value, proxy)

    return proxy
}

export interface Target {
    [ReactiveFlag.Reactive]: boolean
    [ReactiveFlag.RAW]: Target
}

export function isReactive(value: unknown) {
    return !!(isObject(value) && (value as Target)[ReactiveFlag.Reactive])
}

/**
 * use string type for readability
 */
export enum TargetType {
    Invalid = 'invalid',
    Common = 'common',
    Collection = 'Collection',
}

export function getTargetType(target: object) {
    switch (getObjectType(target)) {
        case 'Set':
        case 'WeakSet':
        case 'Map':
        case 'WeakMap':
            return TargetType.Collection
        case 'Object':
        case 'Array':
            return TargetType.Common
        default:
            return TargetType.Invalid
    }
}

export enum ReactiveFlag {
    Reactive = '__reactive__',
    RAW = '__raw__',
}

export function toRaw<T>(value: T): T {
    const raw = value && (value as any)[ReactiveFlag.RAW]
    return raw ? toRaw(raw) : value
}
