import { TelemetryLogPacket, BusModelData } from './bus.interface.js'

export interface BusBit {
    idx: string
    src?: string
    val: number
    dat?: {
        packet?: TelemetryLogPacket
        model?: BusModelData
        error?: string
    }
    slv?: Function
    blk?: Function
}

export default BusBit
