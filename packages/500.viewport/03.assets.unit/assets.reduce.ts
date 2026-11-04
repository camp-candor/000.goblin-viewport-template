import clone from 'clone-deep'
import * as Act from './assets.action'
import { AssetsModel } from './assets.model'
import * as Buzz from './assets.buzzer'
import State from '../99.core/state'

export function reducer(
    model: AssetsModel = new AssetsModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_ASSETS:
            return Buzz.updateAssets(clone(model), act.bale, state)

        case Act.INIT_ASSETS:
            return Buzz.initAssets(clone(model), act.bale, state)

        default:
            return model
    }
}
