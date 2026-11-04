import { Action } from '../99.core/interface/action.interface'
import EdgecontrolBit from './fce/edgecontrol.bit'

// Edgecontrol actions

export const INIT_EDGECONTROL = '[Edgecontrol action] Init Edgecontrol'
export class InitEdgecontrol implements Action {
    readonly type = INIT_EDGECONTROL
    constructor(public bale: EdgecontrolBit) {}
}

export const UPDATE_EDGECONTROL = '[Edgecontrol action] Update Edgecontrol'
export class UpdateEdgecontrol implements Action {
    readonly type = UPDATE_EDGECONTROL
    constructor(public bale: EdgecontrolBit) {}
}

export type Actions = InitEdgecontrol | UpdateEdgecontrol
