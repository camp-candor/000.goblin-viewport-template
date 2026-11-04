import { Action } from '../99.core/interface/action.interface'
import StyleBit from './fce/style.bit'

// Style actions

export const INIT_STYLE = '[Style action] Init Style'
export class InitStyle implements Action {
    readonly type = INIT_STYLE
    constructor(public bale: StyleBit) {}
}

export const UPDATE_STYLE = '[Style action] Update Style'
export class UpdateStyle implements Action {
    readonly type = UPDATE_STYLE
    constructor(public bale: StyleBit) {}
}

export type Actions = InitStyle | UpdateStyle
