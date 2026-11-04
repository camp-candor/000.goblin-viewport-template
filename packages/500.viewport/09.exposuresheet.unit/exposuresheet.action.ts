import { Action } from '../99.core/interface/action.interface'
import ExposuresheetBit from './fce/exposuresheet.bit'

// Exposuresheet actions

export const INIT_EXPOSURESHEET = '[Exposuresheet action] Init Exposuresheet'
export class InitExposuresheet implements Action {
    readonly type = INIT_EXPOSURESHEET
    constructor(public bale: ExposuresheetBit) {}
}

export const UPDATE_EXPOSURESHEET =
    '[Exposuresheet action] Update Exposuresheet'
export class UpdateExposuresheet implements Action {
    readonly type = UPDATE_EXPOSURESHEET
    constructor(public bale: ExposuresheetBit) {}
}

export type Actions = InitExposuresheet | UpdateExposuresheet
