import clone from 'clone-deep'
import * as Act from './sourcebaking.action'
import { SourcebakingModel } from './sourcebaking.model'
import * as Buzz from './sourcebaking.buzzer'
import State from '../99.core/state'

export function reducer(
    model: SourcebakingModel = new SourcebakingModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_SOURCEBAKING:
            return Buzz.updateSourcebaking(clone(model), act.bale, state)

        case Act.INIT_SOURCEBAKING:
            return Buzz.initSourcebaking(clone(model), act.bale, state)

        default:
            return model
    }
}
