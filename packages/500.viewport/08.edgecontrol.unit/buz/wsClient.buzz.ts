/**
 * packages/500.viewport/08.edgecontrol.unit/buz/wsClient.buzz.ts
 * Self-healing WebSocket telemetry client with exponential backoff,
 * monotonic sequence validation, and K=10 historical replay ingestion.
 * Pure 7-bit ASCII compliance.
 */

import { resolveCoordinationEndpoint } from './cascade.buzz.js'
import { routeTelemetryToConsole } from '../../99.bus.unit/buz/bus.buzz.js'

export interface TelemetryClientState {
    ws: WebSocket | null
    status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING'
    lastSeqReceived: number
    reconnectAttempts: number
    isClosedExplicitly: boolean
}

export const telemetryClientState: TelemetryClientState = {
    ws: null,
    status: 'DISCONNECTED',
    lastSeqReceived: 0,
    reconnectAttempts: 0,
    isClosedExplicitly: false,
}

/**
 * Connects to edge WebSocket telemetry stream with automatic reconnection loop.
 */
export function connectTelemetryStream(
    onFrame?: (frame: any) => void,
    CustomWebSocket: typeof WebSocket = (globalThis as any).WebSocket,
): WebSocket | null {
    if (typeof CustomWebSocket !== 'function') {
        routeTelemetryToConsole(
            '>> [WS:CLIENT] WebSocket unavailable in runtime. Running decoupled.',
        )
        return null
    }

    telemetryClientState.isClosedExplicitly = false
    telemetryClientState.status = 'CONNECTING'

    const { resolvedWsUrl } = resolveCoordinationEndpoint()
    const targetUrl = `${resolvedWsUrl}/ws/compile?role=operator`

    routeTelemetryToConsole(
        `>> [WS] Dialing edge telemetry tunnel: ${targetUrl}`,
    )

    try {
        const ws = new CustomWebSocket(targetUrl)
        telemetryClientState.ws = ws

        ws.onopen = () => {
            telemetryClientState.status = 'CONNECTED'
            telemetryClientState.reconnectAttempts = 0
            routeTelemetryToConsole(
                '>> [WS:OPEN] Edge telemetry tunnel established [OK]',
            )
        }

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(
                    typeof event.data === 'string'
                        ? event.data
                        : event.data.toString(),
                )

                // Ingest K=10 Historical Replay Buffer
                if (
                    data.type === 'TELEMETRY_HISTORY' &&
                    Array.isArray(data.items)
                ) {
                    routeTelemetryToConsole(
                        `>> [WS:REPLAY] Restoring ${data.items.length} historical frames:`,
                    )
                    for (const item of data.items) {
                        if (item.seq > telemetryClientState.lastSeqReceived) {
                            telemetryClientState.lastSeqReceived = item.seq
                        }
                        if (item.ascii) {
                            routeTelemetryToConsole(item.ascii)
                        }
                    }
                    return
                }

                // Live Frame Monotonic Sequence Verification
                if (typeof data.seq === 'number') {
                    if (
                        data.seq > telemetryClientState.lastSeqReceived + 1 &&
                        telemetryClientState.lastSeqReceived !== 0
                    ) {
                        const gap =
                            data.seq -
                            (telemetryClientState.lastSeqReceived + 1)
                        routeTelemetryToConsole(
                            `>> [WS:WARN] Detected sequence gap: missed ${gap} frame(s)`,
                        )
                    }
                    telemetryClientState.lastSeqReceived = data.seq
                }

                if (data.ascii) {
                    routeTelemetryToConsole(data.ascii)
                }

                if (onFrame) onFrame(data)
            } catch {
                // Discard unparseable wire frames
            }
        }

        ws.onclose = () => {
            telemetryClientState.ws = null
            routeTelemetryToConsole(
                '>> [WS:CLOSE] Telemetry connection terminated cleanly.',
            )

            if (telemetryClientState.isClosedExplicitly) {
                telemetryClientState.status = 'DISCONNECTED'
                return
            }

            telemetryClientState.status = 'RECONNECTING'
            scheduleReconnect(onFrame, CustomWebSocket)
        }

        ws.onerror = () => {
            routeTelemetryToConsole(
                '>> [WS:ERROR] WebSocket transport fault detected.',
            )
        }

        return ws
    } catch (err: any) {
        routeTelemetryToConsole(
            `>> [WS:FAIL] Failed to open socket: ${err.message}`,
        )
        scheduleReconnect(onFrame, CustomWebSocket)
        return null
    }
}

function scheduleReconnect(
    onFrame?: (frame: any) => void,
    CustomWebSocket?: typeof WebSocket,
): void {
    telemetryClientState.reconnectAttempts += 1
    const delayMs = Math.min(
        1000 * Math.pow(2, telemetryClientState.reconnectAttempts - 1),
        5000,
    )

    routeTelemetryToConsole(
        `>> [WS:RECONNECT] Reconnecting in ${delayMs}ms (attempt ${telemetryClientState.reconnectAttempts})...`,
    )

    setTimeout(() => {
        if (!telemetryClientState.isClosedExplicitly) {
            connectTelemetryStream(onFrame, CustomWebSocket)
        }
    }, delayMs)
}

export function disconnectTelemetryStream(): void {
    telemetryClientState.isClosedExplicitly = true
    telemetryClientState.status = 'DISCONNECTED'
    if (telemetryClientState.ws) {
        try {
            telemetryClientState.ws.close()
        } catch {
            // Ignore teardown exceptions
        }
        telemetryClientState.ws = null
    }
}
