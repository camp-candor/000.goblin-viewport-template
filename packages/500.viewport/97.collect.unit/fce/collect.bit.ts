import {
    NarrativeDialogueAST,
    HarvestReceipt,
    HarvestPlan,
} from './collect.interface'

export interface CollectBit {
    idx: string
    src?: string
    val: number
    dat?: {
        ast?: NarrativeDialogueAST
        visualVaultPath?: string
        destinationPath?: string
        plan?: HarvestPlan
        receipt?: HarvestReceipt
        error?: string
    }
}
