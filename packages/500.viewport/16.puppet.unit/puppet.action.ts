import { Action } from '../99.core/interface/action.interface'
import PuppetBit from './fce/puppet.bit'

// Puppet actions

export const INIT_PUPPET = '[Puppet action] Init Puppet'
export class InitPuppet implements Action {
    readonly type = INIT_PUPPET
    constructor(public bale: PuppetBit) {}
}

export const UPDATE_PUPPET = '[Puppet action] Update Puppet'
export class UpdatePuppet implements Action {
    readonly type = UPDATE_PUPPET
    constructor(public bale: PuppetBit) {}
}

export type Actions = InitPuppet | UpdatePuppet
