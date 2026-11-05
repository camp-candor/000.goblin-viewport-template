import { BusModelData } from './fce/bus.interface'

export class BusModel implements BusModelData {
    idx: string = '99.bus.unit'
    totalLogsRouted: number = 0
    lastMessage: string = ''
}

export default BusModel
