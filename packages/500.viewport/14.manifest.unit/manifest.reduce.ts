import clone from 'clone-deep'
import * as Act from './manifest.action'
import { ManifestModel } from './manifest.model'
import * as Buzz from './manifest.buzzer'
import State from '../99.core/state'

export function reducer(
    model: ManifestModel = new ManifestModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_MANIFEST:
            return Buzz.updateManifest(clone(model), act.bale, state)

        case Act.INIT_MANIFEST:
            return Buzz.initManifest(clone(model), act.bale, state)

        default:
            return model
    }
}
