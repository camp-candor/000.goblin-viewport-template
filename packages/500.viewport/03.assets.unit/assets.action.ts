import { AssetsBit } from './fce/assets.bit'

export const INIT_ASSETS = 'assets:init'
export const AUDIT_STORAGE_ENVELOPE = 'assets:audit_storage_envelope'

export class InitAssets {
    readonly type = INIT_ASSETS
    constructor(public bale: AssetsBit) {}
}

export class AuditStorageEnvelope {
    readonly type = AUDIT_STORAGE_ENVELOPE
    constructor(public bale: AssetsBit) {}
}

export type AssetsActions = InitAssets | AuditStorageEnvelope
