import { ReactiveEffect, track, trigger, TriggerOpType } from './effects'

export function computed<T>(fn: () => T) {
    return new ComputedImpl(fn)
}

class ComputedImpl<T> {
    private _value: T | undefined = undefined
    private dirty = true

    private effect: ReactiveEffect<T>

    // computed is a ref
    private get __is_ref() {
        return true
    }

    constructor(public readonly fn: () => T) {
        this.effect = new ReactiveEffect(fn, {
            scheduler: () => {
                if (!this.dirty) {
                    // this is computed
                    this.dirty = true
                    trigger(this, TriggerOpType.SET, 'value')
                }
            },
        })
    }

    get value() {
        track(this, 'value')

        if (this.dirty) {
            this.dirty = false
            this._value = this.effect.run()!
        }

        return this._value as T
    }
}
