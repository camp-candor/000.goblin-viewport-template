/**
 * apps/worker/test/unit/websocketRelay.test.ts
 * Vitest verification suite for WebSocket upgrade, hibernation DO, and monotonic stamping.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../../src/index.js'
import { CompilationCoordinatorDO } from '../../src/objects/CompilationCoordinatorDO.js'

describe('Phase 6 Edge Telemetry WebSocket Relay Multiplexer', () => {
    let mockStorage: Map<string, any>
    let mockSockets: any[]
    let doInstance: CompilationCoordinatorDO

    beforeEach(() => {
        mockStorage = new Map()
        mockSockets = []

        const mockCtx: any = {
            storage: {
                get: vi.fn(async (key: string) => mockStorage.get(key)),
                put: vi.fn(async (key: string, value: any) => {
                    mockStorage.set(key, value)
                }),
            },
            acceptWebSocket: vi.fn((ws: any, tags: string[]) => {
                ws.tags = tags
                mockSockets.push(ws)
            }),
            getWebSockets: vi.fn(() => mockSockets),
        }

        doInstance = new CompilationCoordinatorDO(mockCtx, {} as any)
    })

    it('rejects GET /ws/compile without Upgrade: websocket with HTTP 426', async () => {
        const res = await app.request('/ws/compile', {
            method: 'GET',
        })
        expect(res.status).toBe(426)
        expect(await res.text()).toBe('Expected Upgrade: websocket')
    })

    it('accepts valid WebSocket upgrades with HTTP 101 and tags role', async () => {
        const req = new Request('http://127.0.0.1/ws/compile?role=operator', {
            headers: { Upgrade: 'websocket' },
        })

        const res = await doInstance.fetch(req)
        expect(res.status).toBe(101)
        expect(res.webSocket).toBeDefined()
        expect(mockSockets.length).toBe(1)
        expect(mockSockets[0].tags).toEqual(['operator'])
    })

    it('stamps monotonic increasing sequence numbers on successive broadcasts', async () => {
        const f1 = await doInstance.broadcastTelemetry(
            'STEP',
            'ep01_sc03',
            'AST loaded',
        )
        const f2 = await doInstance.broadcastTelemetry(
            'STEP',
            'ep01_sc03',
            'Quantized 72 frames',
        )
        const f3 = await doInstance.broadcastTelemetry(
            'SEAL',
            'ep01_sc03',
            'Manifest written',
        )

        expect(f1.seq).toBe(1)
        expect(f2.seq).toBe(2)
        expect(f3.seq).toBe(3)
    })

    it('maintains bounded K=10 rolling FIFO ring buffer in storage', async () => {
        for (let i = 1; i <= 15; i++) {
            await doInstance.broadcastTelemetry(
                'BURST',
                'ep01_sc03',
                `Frame ${i}`,
            )
        }

        const ring = mockStorage.get('compilation_ring')
        expect(ring.length).toBe(10)
        expect(ring[0].seq).toBe(6)
        expect(ring[9].seq).toBe(15)
    })

    it('replays historical telemetry buffer immediately upon new socket connection', async () => {
        await doInstance.broadcastTelemetry('HISTORIC', 'ep01_sc03', 'Event A')
        await doInstance.broadcastTelemetry('HISTORIC', 'ep01_sc03', 'Event B')

        const sentPayloads: string[] = []
        const clientReq = new Request('http://127.0.0.1/ws/compile', {
            headers: { Upgrade: 'websocket' },
        })

        // Intercept DO fetch response socket creation
        const originalPair = (globalThis as any).WebSocketPair
        try {
            ;(globalThis as any).WebSocketPair = function () {
                const srv = {
                    serializeAttachment: vi.fn(),
                    send: vi.fn((data: string) => sentPayloads.push(data)),
                }
                const cli = {}
                return { 0: cli, 1: srv }
            }

            const res = await doInstance.fetch(clientReq)
            expect(res.status).toBe(101)
            expect(sentPayloads.length).toBe(1)

            const replay = JSON.parse(sentPayloads[0])
            expect(replay.type).toBe('TELEMETRY_HISTORY')
            expect(replay.count).toBe(2)
            expect(replay.items[0].message).toBe('Event A')
        } finally {
            ;(globalThis as any).WebSocketPair = originalPair
        }
    })
})
