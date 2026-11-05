import { GeneratorParams, ScaffoldingReceipt } from './generator.interface'

export interface GeneratorBit {
    idx: string
    src?: string
    val: number
    dat?: {
        params?: GeneratorParams
        receipt?: ScaffoldingReceipt
        error?: string
    }
}
