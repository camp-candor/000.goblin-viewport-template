import clone from 'clone-deep'
import * as Act from './style.action'
import { StyleModel } from './style.model'
import * as Buzz from './style.buzzer'
import State from '../99.core/state'

export function reducer(
    model: StyleModel = new StyleModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_STYLE:
            return Buzz.updateStyle(clone(model), act.bale, state)

        case Act.INIT_STYLE:
            return Buzz.initStyle(clone(model), act.bale, state)

        default:
            return model
    }
}
