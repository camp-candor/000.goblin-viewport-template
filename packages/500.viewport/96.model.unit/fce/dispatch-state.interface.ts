import type { EdgeControlModel } from '../../08.edgecontrol.unit/fce/edgecontrol.interface.js'

export interface ViewportRootModel {
    readonly edgeControl: EdgeControlModel
}

export const INITIAL_EDGE_CONTROL_STATE: EdgeControlModel = Object.freeze({
    idx: '08.edgecontrol.unit',
    status: 'IDLE',
    activeIntent: null,
    latestReceipt: null,
    errorHistory: Object.freeze([]),
    monotonicSequence: 0,
})
