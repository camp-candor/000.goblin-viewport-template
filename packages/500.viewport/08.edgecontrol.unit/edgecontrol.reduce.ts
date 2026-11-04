import clone from 'clone-deep'
import * as Act from './edgecontrol.action'
import { EdgecontrolModel } from './edgecontrol.model'
import * as Buzz from './edgecontrol.buzzer'
import State from '../99.core/state'

export function reducer(
    model: EdgecontrolModel = new EdgecontrolModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_EDGECONTROL:
            return Buzz.updateEdgecontrol(clone(model), act.bale, state)

        case Act.INIT_EDGECONTROL:
            return Buzz.initEdgecontrol(clone(model), act.bale, state)

        default:
            return model
    }
}
