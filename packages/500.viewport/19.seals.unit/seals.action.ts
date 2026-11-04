import { Action } from '../99.core/interface/action.interface'
import SealsBit from './fce/seals.bit'

// Seals actions

export const INIT_SEALS = '[Seals action] Init Seals'
export class InitSeals implements Action {
    readonly type = INIT_SEALS
    constructor(public bale: SealsBit) {}
}

export const UPDATE_SEALS = '[Seals action] Update Seals'
export class UpdateSeals implements Action {
    readonly type = UPDATE_SEALS
    constructor(public bale: SealsBit) {}
}

export type Actions = InitSeals | UpdateSeals
