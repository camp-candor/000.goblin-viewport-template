import { SealsReceipt } from './fce/seals.interface'

export class SealsModel {
    idx: string = '19.seals.unit'
    lastReceipt?: SealsReceipt
    lastStatus: string = 'IDLE'
}
