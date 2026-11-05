export interface TelemetryLogPacket {
    tag: string
    sceneId: string
    message: string
    timestampMs: number
    formattedAscii: string
    topic?: string
    level?: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'
    timestamp?: string
}

export interface BusModelData {
    idx: string
    packets: readonly TelemetryLogPacket[]
    totalPacketsRouted: number
    totalLogsRouted?: number
    lastMessage?: string
}

export type Bus = BusModelData
export default BusModelData
