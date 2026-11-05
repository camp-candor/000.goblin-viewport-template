import State from '../99.core/state'
import { TemporalquantizationModel } from './temporalquantization.model'
import { reducer } from './temporalquantization.reduce'
import * as Act from './temporalquantization.action'
import * as Buzz from './temporalquantization.buzzer'

export default class TemporalquantizationUnit {
    public model: TemporalquantizationModel = new TemporalquantizationModel()

    constructor(state: State) {}

    public accumulateTimeline(ste: any, bale: any, bal: any): void {
        Buzz.runAccumulateTimelineBuzz(ste, bale, bal)
    }
}
