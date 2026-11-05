import { RigsVendoringReceipt } from './fce/rigs.interface'

export class RigsModel {
    idx: string = '18.rigs.unit'
    lastReceipt?: RigsVendoringReceipt
    lastStatus: string = 'IDLE'
}
