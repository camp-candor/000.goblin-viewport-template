import { Action } from '../99.core/interface/action.interface'
import ManifestBit from './fce/manifest.bit'

// Manifest actions

export const INIT_MANIFEST = '[Manifest action] Init Manifest'
export class InitManifest implements Action {
    readonly type = INIT_MANIFEST
    constructor(public bale: ManifestBit) {}
}

export const UPDATE_MANIFEST = '[Manifest action] Update Manifest'
export class UpdateManifest implements Action {
    readonly type = UPDATE_MANIFEST
    constructor(public bale: ManifestBit) {}
}

export type Actions = InitManifest | UpdateManifest
