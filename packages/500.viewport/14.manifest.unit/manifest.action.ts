import { ManifestBit } from './fce/manifest.bit';

export const INIT_MANIFEST = 'manifest:init';
export const MINT_PROVENANCE_LOCKFILE = 'manifest:mint_provenance_lockfile';
export const VERIFY_TOOLCHAIN_ENVIRONMENT = 'manifest:verify_toolchain_environment';

export class InitManifest {
  readonly type = INIT_MANIFEST;
  constructor(public bale: ManifestBit) {}
}

export class MintProvenanceLockfile {
  readonly type = MINT_PROVENANCE_LOCKFILE;
  constructor(public bale: ManifestBit) {}
}

export class VerifyToolchainEnvironment {
  readonly type = VERIFY_TOOLCHAIN_ENVIRONMENT;
  constructor(public bale: ManifestBit) {}
}

export type ManifestActions =
  | InitManifest
  | MintProvenanceLockfile
  | VerifyToolchainEnvironment;
