import clone from 'clone-deep'
import * as Act from './coordinates.action'
import { CoordinatesModel } from './coordinates.model'
import * as Buzz from './coordinates.buzzer'
import State from '../99.core/state'

export function reducer(
    model: CoordinatesModel = new CoordinatesModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_COORDINATES:
            return Buzz.updateCoordinates(clone(model), act.bale, state)

        case Act.INIT_COORDINATES:
            return Buzz.initCoordinates(clone(model), act.bale, state)

        default:
            return model
    }
}
