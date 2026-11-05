import { CoordinatesBit } from './fce/coordinates.bit'

export const INIT_COORDINATES = 'coordinates:init'
export const PARSE_VISUAL_MANIFEST = 'coordinates:parse_visual_manifest'
export const RESOLVE_VARIANT = 'coordinates:resolve_variant'

export class InitCoordinates {
    readonly type = INIT_COORDINATES
    constructor(public bale: CoordinatesBit) {}
}

export class ParseVisualManifest {
    readonly type = PARSE_VISUAL_MANIFEST
    constructor(public bale: CoordinatesBit) {}
}

export class ResolveVariant {
    readonly type = RESOLVE_VARIANT
    constructor(public bale: CoordinatesBit) {}
}

export type CoordinatesActions =
    InitCoordinates | ParseVisualManifest | ResolveVariant
