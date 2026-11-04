import { Action } from '../99.core/interface/action.interface'
import AmbienceBit from './fce/ambience.bit'

// Ambience actions

export const INIT_AMBIENCE = '[Ambience action] Init Ambience'
export class InitAmbience implements Action {
    readonly type = INIT_AMBIENCE
    constructor(public bale: AmbienceBit) {}
}

export const UPDATE_AMBIENCE = '[Ambience action] Update Ambience'
export class UpdateAmbience implements Action {
    readonly type = UPDATE_AMBIENCE
    constructor(public bale: AmbienceBit) {}
}

export type Actions = InitAmbience | UpdateAmbience
