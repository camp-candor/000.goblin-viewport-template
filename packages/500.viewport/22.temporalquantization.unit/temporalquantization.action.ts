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

export const QUANTIZE_SINGLE_SHOT = '[Temporalquantization action] Quantize Single Shot'
export class QuantizeSingleShot implements Action {
    readonly type = QUANTIZE_SINGLE_SHOT
    constructor(public bale: TemporalquantizationBit) {}
}

export const ACCUMULATE_TIMELINE = '[Temporalquantization action] Accumulate Timeline'
export class AccumulateTimeline implements Action {
    readonly type = ACCUMULATE_TIMELINE
    constructor(public bale: TemporalquantizationBit) {}
}

export const ADAPT_CAUSAL_LATTICE = '[Temporalquantization action] Adapt Causal Lattice'
export class AdaptCausalLattice implements Action {
    readonly type = ADAPT_CAUSAL_LATTICE
    constructor(public bale: TemporalquantizationBit) {}
}


export type Actions = InitTemporalquantization | UpdateTemporalquantization | QuantizeSingleShot | AccumulateTimeline | AdaptCausalLattice
