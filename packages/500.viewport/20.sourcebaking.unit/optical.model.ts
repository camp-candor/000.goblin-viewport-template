import { OpticalScopingReceipt } from './fce/optical.interface'

export class OpticalModel {
    idx: string = '20.sourcebaking.unit:optical'
    lastReceipt?: OpticalScopingReceipt
    lastStatus: string = 'IDLE'
}
