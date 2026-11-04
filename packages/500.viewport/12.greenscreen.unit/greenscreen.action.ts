import { Action } from '../99.core/interface/action.interface'
import GreenscreenBit from './fce/greenscreen.bit'

// Greenscreen actions

export const INIT_GREENSCREEN = '[Greenscreen action] Init Greenscreen'
export class InitGreenscreen implements Action {
    readonly type = INIT_GREENSCREEN
    constructor(public bale: GreenscreenBit) {}
}

export const UPDATE_GREENSCREEN = '[Greenscreen action] Update Greenscreen'
export class UpdateGreenscreen implements Action {
    readonly type = UPDATE_GREENSCREEN
    constructor(public bale: GreenscreenBit) {}
}

export type Actions = InitGreenscreen | UpdateGreenscreen
