import clone from 'clone-deep'
import * as Act from './boundary.action'
import { BoundaryModel } from './boundary.model'
import * as Buzz from './boundary.buzzer'
import State from '../99.core/state'

export function reducer(
    model: BoundaryModel = new BoundaryModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_BOUNDARY:
            return Buzz.updateBoundary(clone(model), act.bale, state)

        case Act.INIT_BOUNDARY:
            return Buzz.initBoundary(clone(model), act.bale, state)

        default:
            return model
    }
}
