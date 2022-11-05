type Primitive = null | undefined | string | number | boolean | symbol | bigint

export function isSymbol(value: unknown): value is symbol {
    return typeof value === 'symbol'
}

export const builtInSymbols = new Set(
    Object.getOwnPropertyNames(Symbol)
        .map(key => (Symbol as any)[key])
        .filter(isSymbol),
)

export type Key = string | symbol

export function isPrimitive(value: unknown): value is Primitive {
    return value === null || typeof value !== 'object'
}

export function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null
}

export function isIntegerKey(key: unknown): key is string {
    return (
        typeof key === 'string' && Number.parseInt(key, 10).toString() === key
    )
}

export function getObjectType(target: unknown) {
    // [object Object]
    return Object.prototype.toString.call(target).slice(8, -1)
}

export function hasOwn(object: object, key: Key) {
    return Object.prototype.hasOwnProperty.call(object, key)
}

export function hasChanged(value: any, oldValue: any) {
    return (
        value !== oldValue && !(Number.isNaN(value) && Number.isNaN(oldValue))
    )
}

export type MapTypes = Map<any, any> | WeakMap<any, any>
export type IterableCollection = Map<any, any> | Set<any>
export type WeakCollection = WeakMap<any, any> | WeakSet<any>
export type CollectionTypes = IterableCollection | WeakCollection

export function isIterableCollection(
    value: unknown,
): value is IterableCollection {
    return value instanceof Map || value instanceof Set
}

export function isMap(value: unknown): value is MapTypes {
    return value instanceof Map || value instanceof WeakMap
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number'
}
