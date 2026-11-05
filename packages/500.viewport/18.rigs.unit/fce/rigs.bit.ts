import { VendoringPlan, RigsVendoringReceipt } from './rigs.interface'

export interface RigsBit {
    idx: string
    src?: string
    val: number
    dat?: {
        plan?: VendoringPlan
        targetDir?: string
        receipt?: RigsVendoringReceipt
        error?: string
    }
}
