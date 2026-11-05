import { BusModelData, TelemetryLogPacket } from './fce/bus.interface.js'

export class BusModel implements BusModelData {
    idx: string = '99.bus.unit'
    packets: readonly TelemetryLogPacket[] = []
    totalPacketsRouted: number = 0
    totalLogsRouted: number = 0
    lastMessage: string = ''
}

export default BusModel
