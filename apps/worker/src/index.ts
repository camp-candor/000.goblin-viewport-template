/**
 * apps/worker/src/index.ts
 * Cloudflare Edge Hono Routing Gateway Entrypoint.
 * Mounts REST compilation ingress and /ws/compile WebSocket hibernation proxy.
 * Pure 7-bit ASCII status logging - zero multi-byte emojis.
 */

import { Hono } from 'hono'
import { authGate } from './middleware/authGate.js'
import { compileRoutes } from './routes/compileRoutes.js'
import { CompilationCoordinatorDO } from './objects/CompilationCoordinatorDO.js'

export { CompilationCoordinatorDO }

export interface Env {
    readonly AUTH_TOKEN?: string
    readonly CF_ACCESS_CLIENT_ID?: string
    readonly CF_ACCESS_CLIENT_SECRET?: string
    readonly CLOUDFLARE_ACCOUNT_ID?: string
    readonly CLOUDFLARE_API_TOKEN?: string
    readonly CLOUDFLARE_AI_GATEWAY?: string
    readonly GITHUB_TOKEN?: string
    readonly AI?: any
    readonly AGENT_SESSION?: any
    readonly COMPILATION_COORDINATOR_DO?: DurableObjectNamespace<CompilationCoordinatorDO>
}

export class AgentSessionDO {}

const app = new Hono<{ Bindings: Env }>()

// 1. Root & Public Healthcheck (Zero-Auth Perimeter Probe)
app.get('/', (c) => c.text('REPO-BOT EDGE CONTROL PLANE IS LIVE'))

app.get('/health', (c) => {
    return c.json({
        status: 'ONLINE',
        runtime: 'cloudflare-workers',
        timestamp: Date.now(),
    })
})

// 2. WebSocket Compile Telemetry Relay Handshake (TASK-VT-6.1)
app.get('/ws/compile', async (c) => {
    const upgradeHeader = c.req.header('Upgrade')
    if (upgradeHeader !== 'websocket') {
        return c.text('Expected Upgrade: websocket', 426)
    }

    // Forward raw WebSocket request directly to singleton Durable Object
    if (!c.env.COMPILATION_COORDINATOR_DO) {
        return c.text('Compilation Coordinator unavailable', 503)
    }
    const id = c.env.COMPILATION_COORDINATOR_DO.idFromName(
        'global_compilation_coordinator',
    )
    const stub = c.env.COMPILATION_COORDINATOR_DO.get(id)
    return stub.fetch(c.req.raw)
})

// 3. Authenticated Compilation Ingress Sub-Router
app.use('/api/*', authGate)
app.route('/api/compile', compileRoutes)

// 4. Catch-All Route for Undefined Paths
app.all('*', (c) => {
    return c.json(
        {
            ok: false,
            error: {
                code: 'NOT_FOUND',
                message:
                    'The requested route does not exist on this edge gateway',
            },
        },
        404,
    )
})

export default app
