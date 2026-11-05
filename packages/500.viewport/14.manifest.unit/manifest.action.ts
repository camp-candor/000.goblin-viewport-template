import { Action } from '../99.core/interface/action.interface';
import ManifestBit from './fce/manifest.bit';

export const INIT_MANIFEST = 'manifest:init';
export const MINT_PROVENANCE_LOCKFILE = 'manifest:mint_provenance_lockfile';
export const VERIFY_TOOLCHAIN_ENVIRONMENT = 'manifest:verify_toolchain_environment';

export class InitManifest implements Action {
  readonly type = INIT_MANIFEST;
  constructor(public bale: ManifestBit) {}
}

export class MintProvenanceLockfile implements Action {
  readonly type = MINT_PROVENANCE_LOCKFILE;
  constructor(public bale: ManifestBit) {}
}

export class VerifyToolchainEnvironment implements Action {
  readonly type = VERIFY_TOOLCHAIN_ENVIRONMENT;
  constructor(public bale: ManifestBit) {}
}

export type Actions =
  | InitManifest
  | MintProvenanceLockfile
  | VerifyToolchainEnvironment;
