import { OpticalBit } from './fce/optical.bit'

export const INIT_OPTICAL = 'optical:init'
export const GENERATE_OPTICAL_SCOPES = 'optical:generate_optical_scopes'

export class InitOptical {
    readonly type = INIT_OPTICAL
    constructor(public bale: OpticalBit) {}
}

export class GenerateOpticalScopes {
    readonly type = GENERATE_OPTICAL_SCOPES
    constructor(public bale: OpticalBit) {}
}

export type OpticalActions = InitOptical | GenerateOpticalScopes
