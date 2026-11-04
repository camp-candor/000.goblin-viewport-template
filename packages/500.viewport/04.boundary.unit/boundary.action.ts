import { Action } from '../99.core/interface/action.interface'
import BoundaryBit from './fce/boundary.bit'

// Boundary actions

export const INIT_BOUNDARY = '[Boundary action] Init Boundary'
export class InitBoundary implements Action {
    readonly type = INIT_BOUNDARY
    constructor(public bale: BoundaryBit) {}
}

export const UPDATE_BOUNDARY = '[Boundary action] Update Boundary'
export class UpdateBoundary implements Action {
    readonly type = UPDATE_BOUNDARY
    constructor(public bale: BoundaryBit) {}
}

export type Actions = InitBoundary | UpdateBoundary
