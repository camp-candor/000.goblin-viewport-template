import { Action } from '../99.core/interface/action.interface'
import LifecycleBit from './fce/lifecycle.bit'

// Lifecycle actions

export const INIT_LIFECYCLE = '[Lifecycle action] Init Lifecycle'
export class InitLifecycle implements Action {
    readonly type = INIT_LIFECYCLE
    constructor(public bale: LifecycleBit) {}
}

export const UPDATE_LIFECYCLE = '[Lifecycle action] Update Lifecycle'
export class UpdateLifecycle implements Action {
    readonly type = UPDATE_LIFECYCLE
    constructor(public bale: LifecycleBit) {}
}

export type Actions = InitLifecycle | UpdateLifecycle
