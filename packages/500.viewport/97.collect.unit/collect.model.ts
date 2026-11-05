import { HarvestReceipt } from './fce/collect.interface'

export class CollectModel {
    idx: string = '97.collect.unit'
    lastReceipt?: HarvestReceipt
    lastStatus: string = 'IDLE'
}
