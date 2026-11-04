import { Action } from '../99.core/interface/action.interface.js'
import ViewportBit from './fce/viewport.bit.js'

// viewport actions

export const INIT_VIEWPORT = '[Viewport action] Init Viewport'
export class InitViewport implements Action {
    readonly type = INIT_VIEWPORT
    constructor(public bale: ViewportBit) {}
}

export const UPDATE_VIEWPORT = '[Viewport action] Update Viewport'
export class UpdateViewport implements Action {
    readonly type = UPDATE_VIEWPORT
    constructor(public bale: ViewportBit) {}
}

export const TEST_VIEWPORT = '[Test action] Test Viewport'
export class TestViewport implements Action {
    readonly type = TEST_VIEWPORT
    constructor(public bale: ViewportBit) {}
}

export const INTELLECT_VIEWPORT = '[Intellect action] Intellect Viewport'
export class IntellectViewport implements Action {
    readonly type = INTELLECT_VIEWPORT
    constructor(public bale: ViewportBit) {}
}

export const VISION_VIEWPORT = '[Vision action] Vision Viewport'
export class VisionViewport implements Action {
    readonly type = VISION_VIEWPORT
    constructor(public bale: ViewportBit) {}
}

export const LIST_VIEWPORT = '[List action] List Viewport'
export class ListViewport implements Action {
    readonly type = LIST_VIEWPORT
    constructor(public bale: ViewportBit) {}
}

export type Actions =
    | InitViewport
    | UpdateViewport
    | TestViewport
    | IntellectViewport
    | VisionViewport
    | ListViewport
