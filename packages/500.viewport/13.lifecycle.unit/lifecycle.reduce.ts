import clone from 'clone-deep'
import * as Act from './lifecycle.action'
import { LifecycleModel } from './lifecycle.model'
import * as Buzz from './lifecycle.buzzer'
import State from '../99.core/state'

export function reducer(
    model: LifecycleModel = new LifecycleModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_LIFECYCLE:
            return Buzz.updateLifecycle(clone(model), act.bale, state)

        case Act.INIT_LIFECYCLE:
            return Buzz.initLifecycle(clone(model), act.bale, state)

        default:
            return model
    }
}
