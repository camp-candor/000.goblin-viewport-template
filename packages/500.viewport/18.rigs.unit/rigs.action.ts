import { RigsBit } from './fce/rigs.bit';

export const INIT_RIGS = 'rigs:init';
export const VENDOR_PRESENTATION_RIGS = 'rigs:vendor_presentation_rigs';

export class InitRigs {
  readonly type = INIT_RIGS;
  constructor(public bale: RigsBit) {}
}

export class VendorPresentationRigs {
  readonly type = VENDOR_PRESENTATION_RIGS;
  constructor(public bale: RigsBit) {}
}

export type RigsActions = InitRigs | VendorPresentationRigs;
