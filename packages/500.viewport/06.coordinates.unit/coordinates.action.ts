import { Action } from '../99.core/interface/action.interface'
import CoordinatesBit from './fce/coordinates.bit'

// Coordinates actions

export const INIT_COORDINATES = '[Coordinates action] Init Coordinates'
export class InitCoordinates implements Action {
    readonly type = INIT_COORDINATES
    constructor(public bale: CoordinatesBit) {}
}

export const UPDATE_COORDINATES = '[Coordinates action] Update Coordinates'
export class UpdateCoordinates implements Action {
    readonly type = UPDATE_COORDINATES
    constructor(public bale: CoordinatesBit) {}
}

export type Actions = InitCoordinates | UpdateCoordinates
