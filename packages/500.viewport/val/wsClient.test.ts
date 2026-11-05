/**
 * packages/500.viewport/val/wsClient.test.ts
 * Vitest verification suite for self-healing WebSocket telemetry client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    connectTelemetryStream,
    disconnectTelemetryStream,
    telemetryClientState,
} from '../08.edgecontrol.unit/buz/wsClient.buzz.js'

class MockWebSocket {
    public onopen: (() => void) | null = null
    public onmessage: ((e: any) => void) | null = null
    public onclose: (() => void) | null = null
    public onerror: ((e: any) => void) | null = null
    public static instances: MockWebSocket[] = []

    constructor(public url: string) {
        MockWebSocket.instances.push(this)
        setTimeout(() => {
            if (this.onopen) this.onopen()
        }, 5)
    }

    send = vi.fn()
    close = vi.fn(() => {
        if (this.onclose) this.onclose()
    })
}

describe('Phase 6 Local WebSocket Telemetry Client Engine', () => {
    beforeEach(() => {
        MockWebSocket.instances = []
        disconnectTelemetryStream()
        telemetryClientState.lastSeqReceived = 0
        telemetryClientState.reconnectAttempts = 0
    })

    afterEach(() => {
        disconnectTelemetryStream()
    })

    it('establishes connection and transitions status to CONNECTED', async () => {
        connectTelemetryStream(undefined, MockWebSocket as any)
        expect(telemetryClientState.status).toBe('CONNECTING')

        await new Promise((r) => setTimeout(r, 15))
        expect(telemetryClientState.status).toBe('CONNECTED')
        expect(MockWebSocket.instances.length).toBe(1)
    })

    it('ingests TELEMETRY_HISTORY and upcasts lastSeqReceived without false gap warnings', async () => {
        connectTelemetryStream(undefined, MockWebSocket as any)
        await new Promise((r) => setTimeout(r, 15))

        const ws = MockWebSocket.instances[0]
        const historyPacket = {
            type: 'TELEMETRY_HISTORY',
            items: [
                { seq: 10, ascii: '>> [REPLAY] Event 10' },
                { seq: 11, ascii: '>> [REPLAY] Event 11' },
            ],
        }

        ws.onmessage?.({ data: JSON.stringify(historyPacket) })
        expect(telemetryClientState.lastSeqReceived).toBe(11)

        // Live frame immediately following sequence 11
        ws.onmessage?.({
            data: JSON.stringify({ seq: 12, ascii: '>> [LIVE] Event 12' }),
        })
        expect(telemetryClientState.lastSeqReceived).toBe(12)
    })

    it('triggers self-healing reconnection loop on unintended socket drop', async () => {
        vi.useFakeTimers()
        connectTelemetryStream(undefined, MockWebSocket as any)
        await vi.advanceTimersByTimeAsync(15)
        expect(telemetryClientState.status).toBe('CONNECTED')

        const ws = MockWebSocket.instances[0]
        ws.close() // Server drops connection

        expect(telemetryClientState.status).toBe('RECONNECTING')
        expect(telemetryClientState.reconnectAttempts).toBe(1)

        // Fast-forward exponential backoff timer (1000ms)
        await vi.advanceTimersByTimeAsync(1050)
        expect(MockWebSocket.instances.length).toBe(2)

        vi.useRealTimers()
    })

    it('terminates cleanly on disconnectTelemetryStream without reconnecting', async () => {
        connectTelemetryStream(undefined, MockWebSocket as any)
        await new Promise((r) => setTimeout(r, 15))

        disconnectTelemetryStream()
        expect(telemetryClientState.status).toBe('DISCONNECTED')
        expect(telemetryClientState.isClosedExplicitly).toBe(true)
    })
})
