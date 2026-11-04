import clone from 'clone-deep'
import * as Act from './foley.action'
import { FoleyModel } from './foley.model'
import * as Buzz from './foley.buzzer'
import State from '../99.core/state'

export function reducer(
    model: FoleyModel = new FoleyModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_FOLEY:
            return Buzz.updateFoley(clone(model), act.bale, state)

        case Act.INIT_FOLEY:
            return Buzz.initFoley(clone(model), act.bale, state)

        default:
            return model
    }
}
