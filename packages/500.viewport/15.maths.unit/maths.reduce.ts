import clone from 'clone-deep'
import * as Act from './maths.action'
import { MathsModel } from './maths.model'
import * as Buzz from './maths.buzzer'
import State from '../99.core/state'

export function reducer(
    model: MathsModel = new MathsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_MATHS:
            return Buzz.updateMaths(clone(model), act.bale, state)

        case Act.INIT_MATHS:
            return Buzz.initMaths(clone(model), act.bale, state)

        default:
            return model
    }
}
