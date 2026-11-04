import clone from 'clone-deep'
import * as Act from './viewport.action.js'
import { ViewportModel } from './viewport.model.js'
import * as Buzz from './viewport.buzzer.js'
import State from '../99.core/state.js'

export function reducer(
    model: ViewportModel = new ViewportModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_VIEWPORT:
            return Buzz.updateViewport(clone(model), act.bale, state)

        case Act.INIT_VIEWPORT:
            return Buzz.initViewport(clone(model), act.bale, state)

        case Act.TEST_VIEWPORT:
            return Buzz.testViewport(clone(model), act.bale, state)

        case Act.LIST_VIEWPORT:
            return Buzz.listViewport(clone(model), act.bale, state)

        default:
            return model
    }
}
