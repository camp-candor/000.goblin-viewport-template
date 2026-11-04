import { Action } from '../99.core/interface/action.interface'
import RigsBit from './fce/rigs.bit'

// Rigs actions

export const INIT_RIGS = '[Rigs action] Init Rigs'
export class InitRigs implements Action {
    readonly type = INIT_RIGS
    constructor(public bale: RigsBit) {}
}

export const UPDATE_RIGS = '[Rigs action] Update Rigs'
export class UpdateRigs implements Action {
    readonly type = UPDATE_RIGS
    constructor(public bale: RigsBit) {}
}

export type Actions = InitRigs | UpdateRigs
