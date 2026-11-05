import { SealsBit } from './fce/seals.bit';

export const INIT_SEALS = 'seals:init';
export const EMIT_SEALED_COMPOSITION = 'seals:emit_sealed_composition';
export const ARBITRATE_CLOBBER = 'seals:arbitrate_clobber';

export class InitSeals {
  readonly type = INIT_SEALS;
  constructor(public bale: SealsBit) {}
}

export class EmitSealedComposition {
  readonly type = EMIT_SEALED_COMPOSITION;
  constructor(public bale: SealsBit) {}
}

export class ArbitrateClobber {
  readonly type = ARBITRATE_CLOBBER;
  constructor(public bale: SealsBit) {}
}

export type SealsActions = InitSeals | EmitSealedComposition | ArbitrateClobber;
