import { BusModel } from './bus.model.js'
import { busReducer } from './bus.reduce.js'
import * as Act from './bus.action.js'
import * as Buzz from './bus.buzzer.js'

export class BusUnit {
    public model: BusModel = new BusModel()

    constructor(state?: any) {}

    public reduce(state: BusModel, action: Act.BusActions): BusModel {
        return busReducer(state, action)
    }

    public routeTelemetry(ste: any, bale: any, bal: any): void {
        Buzz.runRouteTelemetryBuzz(ste, bale, bal)
    }
}

export default BusUnit
