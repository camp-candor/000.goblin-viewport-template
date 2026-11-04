import clone from 'clone-deep'
import * as Act from './acousticclock.action'
import { AcousticclockModel } from './acousticclock.model'
import * as Buzz from './acousticclock.buzzer'
import State from '../99.core/state'

export function reducer(
    model: AcousticclockModel = new AcousticclockModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_ACOUSTICCLOCK:
            return Buzz.updateAcousticclock(clone(model), act.bale, state)

        case Act.INIT_ACOUSTICCLOCK:
            return Buzz.initAcousticclock(clone(model), act.bale, state)

        default:
            return model
    }
}
