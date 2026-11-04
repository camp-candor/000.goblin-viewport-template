import { Action } from '../99.core/interface/action.interface'
import CameraBit from './fce/camera.bit'

// Camera actions

export const INIT_CAMERA = '[Camera action] Init Camera'
export class InitCamera implements Action {
    readonly type = INIT_CAMERA
    constructor(public bale: CameraBit) {}
}

export const UPDATE_CAMERA = '[Camera action] Update Camera'
export class UpdateCamera implements Action {
    readonly type = UPDATE_CAMERA
    constructor(public bale: CameraBit) {}
}

export type Actions = InitCamera | UpdateCamera
