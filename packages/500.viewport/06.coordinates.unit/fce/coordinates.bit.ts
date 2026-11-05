import {
    VisualAssetManifest,
    CoordinatesReceipt,
    VariantResolutionResult,
} from './coordinates.interface'

export interface CoordinatesBit {
    idx: string
    src?: string
    val: number
    dat?: {
        rawManifest?: unknown
        manifest?: VisualAssetManifest
        characterId?: string
        emotion?: string
        resolution?: VariantResolutionResult
        receipt?: CoordinatesReceipt
        error?: string
    }
}
