import clone from 'clone-deep'
import * as Act from './greenscreen.action'
import { GreenscreenModel } from './greenscreen.model'
import * as Buzz from './greenscreen.buzzer'
import State from '../99.core/state'

export function reducer(
    model: GreenscreenModel = new GreenscreenModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_GREENSCREEN:
            return Buzz.updateGreenscreen(clone(model), act.bale, state)

        case Act.INIT_GREENSCREEN:
            return Buzz.initGreenscreen(clone(model), act.bale, state)

        default:
            return model
    }
}
