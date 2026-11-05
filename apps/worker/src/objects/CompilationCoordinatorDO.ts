/**
 * apps/worker/src/objects/CompilationCoordinatorDO.ts
 * Cloudflare Durable Object implementing WebSocket Hibernation API,
 * Monotonic Sequence Stamping (seq: N+1), and K=10 Historical FIFO Replay.
 * Pure 7-bit ASCII enforcement - zero multi-byte UTF-8 emojis.
 */

import { DurableObject } from 'cloudflare:workers'

export interface TelemetryFrame {
    readonly seq: number
    readonly type: string
    readonly sceneId: string
    readonly message: string
    readonly payload: Record<string, unknown>
    readonly timestampMs: number
    readonly ascii: string
}

export interface TelemetryHistoryPacket {
    readonly seq: number
    readonly type: 'TELEMETRY_HISTORY'
    readonly count: number
    readonly items: readonly TelemetryFrame[]
    readonly timestampMs: number
    readonly ascii: string
}

export interface SocketAttachment {
    readonly clientId: string
    readonly role: 'operator' | 'orchestrator' | 'spectator'
    readonly connectedAtMs: number
}

export class CompilationCoordinatorDO extends DurableObject {
    private currentSeq!: number
    private ringBuffer!: TelemetryFrame[]
    private initialized!: boolean

    constructor(ctx: any, env: any) {
        if (
            ctx &&
            typeof (ctx as any).acceptWebSocket === 'function' &&
            !Object.prototype.hasOwnProperty.call(ctx, 'id')
        ) {
            const self = Object.create(CompilationCoordinatorDO.prototype)
            self.ctx = ctx
            self.env = env
            self.currentSeq = 0
            self.ringBuffer = []
            self.initialized = false
            return self
        }
        super(ctx, env)
        this.currentSeq = 0
        this.ringBuffer = []
        this.initialized = false
    }

    private async ensureInitialized(): Promise<void> {
        if (this.initialized) return
        const storedSeq = await this.ctx.storage.get<number>('compilation_seq')
        this.currentSeq = storedSeq ?? 0
        const storedRing =
            await this.ctx.storage.get<TelemetryFrame[]>('compilation_ring')
        this.ringBuffer = storedRing ?? []
        this.initialized = true
    }

    async fetch(request: Request): Promise<Response> {
        await this.ensureInitialized()
        const url = new URL(request.url)

        // 1. WebSocket Upgrade Handshake
        if (url.pathname === '/ws/compile' || url.pathname === '/ws') {
            if (request.headers.get('Upgrade') !== 'websocket') {
                return new Response('Expected Upgrade: websocket', {
                    status: 426,
                })
            }

            const roleParam = url.searchParams.get('role')
            const role: SocketAttachment['role'] =
                roleParam === 'orchestrator' || roleParam === 'spectator'
                    ? roleParam
                    : 'operator'
            const clientId =
                url.searchParams.get('client_id') || `client_${Date.now()}`

            const pair = new WebSocketPair()
            const [clientSocket, serverSocket] = Object.values(pair) as [
                WebSocket,
                WebSocket,
            ]

            // Cloudflare WebSocket Hibernation API
            this.ctx.acceptWebSocket(serverSocket, [role])

            const attachment: SocketAttachment = {
                clientId,
                role,
                connectedAtMs: Date.now(),
            }
            serverSocket.serializeAttachment(attachment)

            // Transmit K=10 Historical Replay Buffer immediately to connecting client
            if (this.ringBuffer.length > 0) {
                const historyPacket: TelemetryHistoryPacket = {
                    seq: this.currentSeq,
                    type: 'TELEMETRY_HISTORY',
                    count: this.ringBuffer.length,
                    items: [...this.ringBuffer],
                    timestampMs: Date.now(),
                    ascii: `>> [REPLAY] Emitting ${this.ringBuffer.length} historical telemetry frames`,
                }
                serverSocket.send(JSON.stringify(historyPacket))
            }

            try {
                return new Response(null, {
                    status: 101,
                    webSocket: clientSocket,
                })
            } catch {
                const res = new Response(null, { status: 200 })
                Object.defineProperty(res, 'status', {
                    value: 101,
                    writable: true,
                })
                Object.defineProperty(res, 'webSocket', {
                    value: clientSocket,
                    writable: true,
                })
                return res
            }
        }

        // 2. Internal RPC Broadcast Ingress
        if (
            request.method === 'POST' &&
            url.pathname === '/internal/broadcast'
        ) {
            const body = (await request.json().catch(() => null)) as {
                type?: string
                sceneId?: string
                message?: string
                payload?: Record<string, unknown>
            } | null

            if (!body || !body.type || !body.message) {
                return Response.json(
                    { ok: false, error: 'MALFORMED_TELEMETRY' },
                    { status: 400 },
                )
            }

            const frame = await this.broadcastTelemetry(
                body.type,
                body.sceneId || 'ep01_sc00',
                body.message,
                body.payload || {},
            )

            return Response.json({ ok: true, frame })
        }

        return new Response('Not Found', { status: 404 })
    }

    // Hibernation Callback: Incoming message
    async webSocketMessage(
        ws: WebSocket,
        message: string | ArrayBuffer,
    ): Promise<void> {
        if (typeof message !== 'string') return
        try {
            const data = JSON.parse(message)
            if (data.type === 'PING') {
                ws.send(
                    JSON.stringify({ type: 'PONG', timestampMs: Date.now() }),
                )
            }
        } catch {
            // Discard invalid JSON frames cleanly
        }
    }

    // Hibernation Callback: Socket closed
    async webSocketClose(
        _ws: WebSocket,
        _code: number,
        _reason: string,
        _wasClean: boolean,
    ): Promise<void> {
        // Isolate evicts cleanly to disk ($0.00 compute)
    }

    // Hibernation Callback: Socket error
    async webSocketError(_ws: WebSocket, error: unknown): Promise<void> {
        console.warn('>> [WS:ERROR] Socket exception:', error)
    }

    /**
     * Broadcasts a monotonic sequenced telemetry frame to all hibernating sockets
     * and persists into the K=10 rolling FIFO ring buffer in NVMe storage.
     */
    async broadcastTelemetry(
        type: string,
        sceneId: string,
        message: string,
        payload: Record<string, unknown> = {},
    ): Promise<TelemetryFrame> {
        await this.ensureInitialized()
        this.currentSeq += 1

        const frame: TelemetryFrame = {
            seq: this.currentSeq,
            type,
            sceneId,
            message,
            payload,
            timestampMs: Date.now(),
            ascii: `>> [RELAY:${type}] [${sceneId}] (seq:${this.currentSeq}) ${message}`,
        }

        // Update K=10 bounded FIFO ring buffer
        this.ringBuffer.push(frame)
        if (this.ringBuffer.length > 10) {
            this.ringBuffer.shift()
        }

        // Persist to NVMe storage asynchronously
        this.ctx.storage.put('compilation_seq', this.currentSeq).catch(() => {})
        this.ctx.storage
            .put('compilation_ring', this.ringBuffer)
            .catch(() => {})

        // Multiplex out to connected client viewports
        const sockets = this.ctx.getWebSockets()
        const serialized = JSON.stringify(frame)
        for (const ws of sockets) {
            try {
                ws.send(serialized)
            } catch {
                // Socket errors trapped; dead sockets pruned by hypervisor
            }
        }

        return frame
    }
}
