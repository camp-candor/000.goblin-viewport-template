import clone from 'clone-deep'
import * as Act from './seals.action'
import { SealsModel } from './seals.model'
import * as Buzz from './seals.buzzer'
import State from '../99.core/state'

export function reducer(
    model: SealsModel = new SealsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_SEALS:
            return Buzz.updateSeals(clone(model), act.bale, state)

        case Act.INIT_SEALS:
            return Buzz.initSeals(clone(model), act.bale, state)

        default:
            return model
    }
}
