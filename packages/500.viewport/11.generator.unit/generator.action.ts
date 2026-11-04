import { Action } from '../99.core/interface/action.interface'
import GeneratorBit from './fce/generator.bit'

// Generator actions

export const INIT_GENERATOR = '[Generator action] Init Generator'
export class InitGenerator implements Action {
    readonly type = INIT_GENERATOR
    constructor(public bale: GeneratorBit) {}
}

export const UPDATE_GENERATOR = '[Generator action] Update Generator'
export class UpdateGenerator implements Action {
    readonly type = UPDATE_GENERATOR
    constructor(public bale: GeneratorBit) {}
}

export type Actions = InitGenerator | UpdateGenerator
