import { TelemetryLogPacket, BusModelData } from './bus.interface'

export interface BusBit {
    idx: string
    src?: string
    val: number
    dat?: {
        packet?: TelemetryLogPacket
        model?: BusModelData
        error?: string
    }
}

export default BusBit
