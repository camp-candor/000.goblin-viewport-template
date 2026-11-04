import clone from 'clone-deep'
import * as Act from './exposuresheet.action'
import { ExposuresheetModel } from './exposuresheet.model'
import * as Buzz from './exposuresheet.buzzer'
import State from '../99.core/state'

export function reducer(
    model: ExposuresheetModel = new ExposuresheetModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_EXPOSURESHEET:
            return Buzz.updateExposuresheet(clone(model), act.bale, state)

        case Act.INIT_EXPOSURESHEET:
            return Buzz.initExposuresheet(clone(model), act.bale, state)

        default:
            return model
    }
}
