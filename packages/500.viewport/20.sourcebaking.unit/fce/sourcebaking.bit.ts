import { BakeCompositionInput, BakeReceipt } from './sourcebaking.interface'

export interface SourceBakingBit {
    idx: string
    src?: string
    val: number
    dat?: {
        input?: BakeCompositionInput
        receipt?: BakeReceipt
        error?: string
    }
}
