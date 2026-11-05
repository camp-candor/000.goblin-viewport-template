import type { EdgeControlModel } from './fce/edgecontrol.interface.js'
import { edgeControlReducer } from './edgecontrol.reduce.js'
import { INITIAL_EDGE_CONTROL_STATE } from '../96.model.unit/fce/dispatch-state.interface.js'

export default class EdgeControlUnit {
    private state: EdgeControlModel = INITIAL_EDGE_CONTROL_STATE

    public getState(): EdgeControlModel {
        return this.state
    }

    public dispatch(action: any): EdgeControlModel {
        this.state = edgeControlReducer(this.state, action)
        return this.state
    }
}
