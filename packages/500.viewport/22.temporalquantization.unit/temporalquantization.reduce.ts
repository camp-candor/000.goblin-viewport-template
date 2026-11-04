import clone from 'clone-deep'
import * as Act from './temporalquantization.action'
import { TemporalquantizationModel } from './temporalquantization.model'
import * as Buzz from './temporalquantization.buzzer'
import State from '../99.core/state'

export function reducer(
    model: TemporalquantizationModel = new TemporalquantizationModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_TEMPORALQUANTIZATION:
            return Buzz.updateTemporalquantization(
                clone(model),
                act.bale,
                state,
            )

        case Act.INIT_TEMPORALQUANTIZATION:
            return Buzz.initTemporalquantization(clone(model), act.bale, state)

        case Act.ACCUMULATE_TIMELINE: {
            const newModel = clone(model)
            newModel.lastStatus = 'QUANTIZED'
            return newModel
        }

        default:
            return model
    }
}
