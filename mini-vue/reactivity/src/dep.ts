import type { ReactiveEffect } from './effects'

export class Dep {
    public readonly effects: Set<ReactiveEffect>

    constructor(effects: Iterable<ReactiveEffect>) {
        this.effects = new Set(effects)
    }

    add(effect: ReactiveEffect) {
        this.effects.add(effect)
        effect.deps.add(this)
    }
}

export function createDep(effects?: Iterable<ReactiveEffect>) {
    return new Dep(effects || [])
}
