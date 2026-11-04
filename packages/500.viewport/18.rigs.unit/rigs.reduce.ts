import clone from 'clone-deep'
import * as Act from './rigs.action'
import { RigsModel } from './rigs.model'
import * as Buzz from './rigs.buzzer'
import State from '../99.core/state'

export function reducer(
    model: RigsModel = new RigsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_RIGS:
            return Buzz.updateRigs(clone(model), act.bale, state)

        case Act.INIT_RIGS:
            return Buzz.initRigs(clone(model), act.bale, state)

        default:
            return model
    }
}
