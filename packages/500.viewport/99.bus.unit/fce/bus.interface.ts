export interface TelemetryLogPacket {
    topic: string
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'
    message: string
    timestamp?: string
}

export interface BusModelData {
    idx: string
    totalLogsRouted: number
    lastMessage: string
}

export type Bus = BusModelData
export default BusModelData
