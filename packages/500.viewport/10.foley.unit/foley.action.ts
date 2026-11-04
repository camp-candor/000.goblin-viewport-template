import { Action } from '../99.core/interface/action.interface'
import FoleyBit from './fce/foley.bit'

// Foley actions

export const INIT_FOLEY = '[Foley action] Init Foley'
export class InitFoley implements Action {
    readonly type = INIT_FOLEY
    constructor(public bale: FoleyBit) {}
}

export const UPDATE_FOLEY = '[Foley action] Update Foley'
export class UpdateFoley implements Action {
    readonly type = UPDATE_FOLEY
    constructor(public bale: FoleyBit) {}
}

export type Actions = InitFoley | UpdateFoley
