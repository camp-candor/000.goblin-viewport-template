import clone from 'clone-deep'
import * as Act from './camera.action'
import { CameraModel } from './camera.model'
import * as Buzz from './camera.buzzer'
import State from '../99.core/state'

export function reducer(
    model: CameraModel = new CameraModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_CAMERA:
            return Buzz.updateCamera(clone(model), act.bale, state)

        case Act.INIT_CAMERA:
            return Buzz.initCamera(clone(model), act.bale, state)

        default:
            return model
    }
}
