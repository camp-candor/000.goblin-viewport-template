import clone from 'clone-deep'
import * as Act from './ambience.action'
import { AmbienceModel } from './ambience.model'
import * as Buzz from './ambience.buzzer'
import State from '../99.core/state'

export function reducer(
    model: AmbienceModel = new AmbienceModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_AMBIENCE:
            return Buzz.updateAmbience(clone(model), act.bale, state)

        case Act.INIT_AMBIENCE:
            return Buzz.initAmbience(clone(model), act.bale, state)

        default:
            return model
    }
}
