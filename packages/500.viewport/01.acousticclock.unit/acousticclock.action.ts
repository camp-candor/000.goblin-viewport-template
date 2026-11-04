import { Action } from '../99.core/interface/action.interface'
import AcousticclockBit from './fce/acousticclock.bit'

// Acousticclock actions

export const INIT_ACOUSTICCLOCK = '[Acousticclock action] Init Acousticclock'
export class InitAcousticclock implements Action {
    readonly type = INIT_ACOUSTICCLOCK
    constructor(public bale: AcousticclockBit) {}
}

export const UPDATE_ACOUSTICCLOCK =
    '[Acousticclock action] Update Acousticclock'
export class UpdateAcousticclock implements Action {
    readonly type = UPDATE_ACOUSTICCLOCK
    constructor(public bale: AcousticclockBit) {}
}

export type Actions = InitAcousticclock | UpdateAcousticclock
