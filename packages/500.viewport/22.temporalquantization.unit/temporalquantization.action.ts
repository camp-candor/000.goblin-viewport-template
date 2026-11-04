import { Action } from '../99.core/interface/action.interface'
import TemporalquantizationBit from './fce/temporalquantization.bit'

// Temporalquantization actions

export const INIT_TEMPORALQUANTIZATION =
    '[Temporalquantization action] Init Temporalquantization'
export class InitTemporalquantization implements Action {
    readonly type = INIT_TEMPORALQUANTIZATION
    constructor(public bale: TemporalquantizationBit) {}
}

export const UPDATE_TEMPORALQUANTIZATION =
    '[Temporalquantization action] Update Temporalquantization'
export class UpdateTemporalquantization implements Action {
    readonly type = UPDATE_TEMPORALQUANTIZATION
    constructor(public bale: TemporalquantizationBit) {}
}

export type Actions = InitTemporalquantization | UpdateTemporalquantization
