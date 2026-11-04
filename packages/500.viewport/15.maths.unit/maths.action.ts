import { Action } from '../99.core/interface/action.interface'
import MathsBit from './fce/maths.bit'

// Maths actions

export const INIT_MATHS = '[Maths action] Init Maths'
export class InitMaths implements Action {
    readonly type = INIT_MATHS
    constructor(public bale: MathsBit) {}
}

export const UPDATE_MATHS = '[Maths action] Update Maths'
export class UpdateMaths implements Action {
    readonly type = UPDATE_MATHS
    constructor(public bale: MathsBit) {}
}

export type Actions = InitMaths | UpdateMaths
