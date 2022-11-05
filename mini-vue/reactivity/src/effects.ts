import { isIntegerKey, isMap } from './utils'
import { createDep, Dep } from './dep'

export interface RawEffect {
    (): void
}

export class ReactiveEffect<T = any> {
    public readonly deps = new Set<Dep>()
    public parent: ReactiveEffect | undefined = undefined
    public readonly lazy: boolean
    public readonly scheduler?: ReactiveEffectScheduler

    constructor(public readonly fn: () => T, options?: ReactiveEffectOptions) {
        this.lazy = options?.lazy ?? false
        this.scheduler = options?.scheduler
    }

    get isRecursiveCall() {
        for (let parent = this.parent; parent; parent = parent.parent) {
            if (parent === this) {
                return true
            }
        }
        return false
    }

    run() {
        this.parent = activeEffect

        // TODO: need optimization
        cleanup(this)

        if (this.isRecursiveCall) {
            return
        }

        activeEffect = this
        const result = this.fn()
        activeEffect = this.parent

        return result
    }
}

function cleanup(effect: ReactiveEffect) {
    for (const dep of effect.deps) {
        dep.effects.delete(effect)
    }
}

const targetsMap = new Map<any, Map<any, Dep>>()

const __DEV__ = true
/**
 * 对象/Array/Set/Map 值的遍历
 */
export const ITERATE_KEY = Symbol(__DEV__ ? 'iterate' : '')
/**
 * Map key的遍历
 */
export const MAP_KEY_ITERATE_KEY = Symbol(__DEV__ ? 'map iterate key' : '')

export enum TriggerOpType {
    ADD,
    SET,
    DELETE,
    CLEAR,
}

let activeEffect: ReactiveEffect | undefined

let shouldTrack = true
const trackStack: boolean[] = []

export function enableTracking() {
    trackStack.push(shouldTrack)
    shouldTrack = true
}

export function pauseTracking() {
    trackStack.push(shouldTrack)
    shouldTrack = false
}

export function resetTracking() {
    const last = trackStack.pop()
    shouldTrack = last ?? true
}

export function track(target: object, key: unknown) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetsMap.get(target)
        if (!depsMap) {
            targetsMap.set(target, (depsMap = new Map()))
        }

        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key, (dep = createDep()))
        }

        dep.add(activeEffect)
    }
}

export function trigger(
    target: object,
    type: TriggerOpType,
    key?: unknown,
    newValue?: unknown,
    oldValue?: unknown,
) {
    const depsMap = targetsMap.get(target)
    if (!depsMap) {
        return
    }

    const deps: Array<Dep | undefined> = []

    if (type === TriggerOpType.CLEAR) {
        // 包括size属性和MAP_ITERATE_KEY
        deps.push(...depsMap.values())
    } else if (Array.isArray(target) && key === 'length') {
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= (newValue as number)) {
                deps.push(dep)
            }
        })
    } else {
        // ADD/SET/DELETE 都会触发单个值的变化
        deps.push(depsMap.get(key))

        switch (type) {
            case TriggerOpType.ADD:
                if (!Array.isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY))
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
                    }
                } else if (isIntegerKey(key)) {
                    deps.push(depsMap.get('length'))
                }
                break
            case TriggerOpType.SET:
                if (isMap(target)) {
                    deps.push(depsMap.get(ITERATE_KEY))
                }
                break
            case TriggerOpType.DELETE:
                if (!Array.isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY))
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
                    }
                }
                break
            default:
                break
        }
    }

    const effects = deps.reduce<ReactiveEffect[]>(
        (effects, dep) => [...effects, ...(dep?.effects ?? [])],
        [],
    )
    // dedup
    triggerEffects(new Set(effects))
}

function triggerEffects(effects: Iterable<ReactiveEffect>) {
    for (const effect of effects) {
        triggerEffect(effect)
    }
}

function triggerEffect(effect: ReactiveEffect) {
    if (activeEffect !== effect) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

interface ReactiveEffectScheduler {
    (...args: any[]): any
}

interface ReactiveEffectOptions {
    lazy?: boolean
    scheduler?: ReactiveEffectScheduler
}

export interface ReactiveEffectRunner {
    (): void
}

export function effect(
    fn: RawEffect | ReactiveEffect,
    options?: ReactiveEffectOptions,
) {
    // TODO: different with vue
    const reactiveEffect =
        fn instanceof ReactiveEffect ? fn : new ReactiveEffect(fn, options)

    const runner = reactiveEffect.run.bind(reactiveEffect)

    if (!reactiveEffect.lazy) {
        runner()
    }

    return runner as ReactiveEffectRunner
}
