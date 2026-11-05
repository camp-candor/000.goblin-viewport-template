import { ShotScopingPlan, OpticalScopingReceipt } from './optical.interface'

export interface OpticalBit {
    idx: string
    src?: string
    val: number
    dat?: {
        episodeId?: string
        shots?: ShotScopingPlan[]
        receipt?: OpticalScopingReceipt
        error?: string
    }
}
