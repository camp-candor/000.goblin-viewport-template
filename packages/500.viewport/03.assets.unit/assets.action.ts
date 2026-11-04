import { Action } from '../99.core/interface/action.interface'
import AssetsBit from './fce/assets.bit'

// Assets actions

export const INIT_ASSETS = '[Assets action] Init Assets'
export class InitAssets implements Action {
    readonly type = INIT_ASSETS
    constructor(public bale: AssetsBit) {}
}

export const UPDATE_ASSETS = '[Assets action] Update Assets'
export class UpdateAssets implements Action {
    readonly type = UPDATE_ASSETS
    constructor(public bale: AssetsBit) {}
}

export type Actions = InitAssets | UpdateAssets
