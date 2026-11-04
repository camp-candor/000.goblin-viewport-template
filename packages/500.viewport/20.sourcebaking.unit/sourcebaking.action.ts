import { Action } from '../99.core/interface/action.interface'
import SourcebakingBit from './fce/sourcebaking.bit'

// Sourcebaking actions

export const INIT_SOURCEBAKING = '[Sourcebaking action] Init Sourcebaking'
export class InitSourcebaking implements Action {
    readonly type = INIT_SOURCEBAKING
    constructor(public bale: SourcebakingBit) {}
}

export const UPDATE_SOURCEBAKING = '[Sourcebaking action] Update Sourcebaking'
export class UpdateSourcebaking implements Action {
    readonly type = UPDATE_SOURCEBAKING
    constructor(public bale: SourcebakingBit) {}
}

export type Actions = InitSourcebaking | UpdateSourcebaking
