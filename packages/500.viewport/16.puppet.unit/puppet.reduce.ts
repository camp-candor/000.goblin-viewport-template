import clone from 'clone-deep'
import * as Act from './puppet.action'
import { PuppetModel } from './puppet.model'
import * as Buzz from './puppet.buzzer'
import State from '../99.core/state'

export function reducer(
    model: PuppetModel = new PuppetModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_PUPPET:
            return Buzz.updatePuppet(clone(model), act.bale, state)

        case Act.INIT_PUPPET:
            return Buzz.initPuppet(clone(model), act.bale, state)

        default:
            return model
    }
}
