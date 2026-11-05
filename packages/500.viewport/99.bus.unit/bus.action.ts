import { BusBit } from './fce/bus.bit'

export const INIT_BUS = 'bus:init'
export const ROUTE_TELEMETRY = 'bus:route_telemetry'
export const SANITIZE_LOG = 'bus:sanitize_log'

export class InitBus {
    readonly type = INIT_BUS
    constructor(public bale: BusBit) {}
}

export class RouteTelemetry {
    readonly type = ROUTE_TELEMETRY
    constructor(public bale: BusBit) {}
}

export class SanitizeLog {
    readonly type = SANITIZE_LOG
    constructor(public bale: BusBit) {}
}

export type BusActions = InitBus | RouteTelemetry | SanitizeLog
