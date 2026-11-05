import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import http from 'node:http'
import {
    resolveCoordinationEndpoint,
    setRuntimeEndpoint,
    clearRuntimeEndpoint,
    CANONICAL_LOCAL_LOOPBACK,
} from '../08.edgecontrol.unit/buz/cascade.buzz.js'
import { dispatchEdgeHttpRequest } from '../08.edgecontrol.unit/buz/client.buzz.js'
import { executeWithContinuityFallback } from '../08.edgecontrol.unit/buz/interceptor.buzz.js'
import type { CompileEpisodeIntentPayload } from '../08.edgecontrol.unit/fce/edgecontrol.interface.js'

describe('Phase 2 Local Endpoint Resolution Cascade Engine', () => {
    const originalEnv = process.env

    beforeEach(() => {
        process.env = { ...originalEnv }
        clearRuntimeEndpoint()
        delete (globalThis as any).agentBaseUrl
        delete (globalThis as any).packageBaseUrl
        delete process.env.LIVE_WORKER_URL
        delete process.env.WORKER_URL
        delete process.env.LOCAL_WORKER_URL
    })

    afterEach(() => {
        process.env = originalEnv
        clearRuntimeEndpoint()
        delete (globalThis as any).packageBaseUrl
    })

    it('Tier 4: falls back to canonical local loopback when all pointers are absent', () => {
        const res = resolveCoordinationEndpoint()
        expect(res.resolvedUrl).toBe(CANONICAL_LOCAL_LOOPBACK)
        expect(res.resolvedWsUrl).toBe('ws://127.0.0.1:8787')
        expect(res.sourceTier).toBe('LOCAL_DEFAULT')
    })

    it('Tier 3: resolves process.env.WORKER_URL and strips trailing slashes', () => {
        process.env.WORKER_URL = 'http://127.0.0.1:9090///'
        const res = resolveCoordinationEndpoint()
        expect(res.resolvedUrl).toBe('http://127.0.0.1:9090')
        expect(res.resolvedWsUrl).toBe('ws://127.0.0.1:9090')
        expect(res.sourceTier).toBe('ENV_CONFIG')
    })

    it('Tier 2: overrides Tier 3 when (globalThis as any).packageBaseUrl is set', () => {
        process.env.WORKER_URL = 'http://127.0.0.1:9090'
        ;(globalThis as any).packageBaseUrl =
            'https://package-test-override.internal'

        const res = resolveCoordinationEndpoint()
        expect(res.resolvedUrl).toBe('https://package-test-override.internal')
        expect(res.resolvedWsUrl).toBe('wss://package-test-override.internal')
        expect(res.sourceTier).toBe('PACKAGE_OVERRIDE')
    })

    it('Tier 1: prioritizes active switchboard pointer over all other tiers', () => {
        process.env.WORKER_URL = 'http://127.0.0.1:9090'
        ;(globalThis as any).packageBaseUrl =
            'https://package-test-override.internal'
        setRuntimeEndpoint('http://127.0.0.1:8787/')

        const res = resolveCoordinationEndpoint()
        expect(res.resolvedUrl).toBe('http://127.0.0.1:8787')
        expect(res.sourceTier).toBe('SWITCHBOARD')
    })

    it('The Never-Cache Invariant: dynamically updates on successive calls', () => {
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            CANONICAL_LOCAL_LOOPBACK,
        )

        setRuntimeEndpoint('http://127.0.0.1:9999')
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            'http://127.0.0.1:9999',
        )

        clearRuntimeEndpoint()
        expect(resolveCoordinationEndpoint().resolvedUrl).toBe(
            CANONICAL_LOCAL_LOOPBACK,
        )
    })

    it('aborts stalled requests breaching the timeout ceiling and returns 408', async () => {
        const stallServer = http.createServer((_req, _res) => {
            // Intentionally never respond
        })

        await new Promise<void>((resolve) =>
            stallServer.listen(0, '127.0.0.1', resolve),
        )
        const port = (stallServer.address() as any).port
        setRuntimeEndpoint(`http://127.0.0.1:${port}`)

        const res = await dispatchEdgeHttpRequest({
            endpointPath: '/stall',
            timeoutMs: 150,
        })

        stallServer.close()
        expect(res.ok).toBe(false)
        expect(res.status).toBe(408)
        expect(res.error?.code).toBe('REQUEST_TIMEOUT')
    })

    it('intercepts connection refused and seamlessly activates local fallback', async () => {
        // Target an unallocated local port to force ECONNREFUSED
        setRuntimeEndpoint('http://127.0.0.1:64321')

        const intent: CompileEpisodeIntentPayload = {
            seriesSlug: 'under-the-floorboards',
            sceneId: 'ep01_sc03',
            manifestPath: '/manifests/ep01.json',
            astPath: '/ast/ep01.json',
            targetFrameBudget: 72,
            idempotencyKey: '018f67b5-0000-7000-8000-000000000002',
            requestedAtMs: Date.now(),
        }

        let localExecuted = false
        const fallbackReceipt = await executeWithContinuityFallback(
            intent,
            async (i) => {
                localExecuted = true
                return { success: true, outDir: `/local-goblin/${i.sceneId}` }
            },
        )

        expect(localExecuted).toBe(true)
        expect(fallbackReceipt.executionMode).toBe('LOCAL_IN_PROCESS_FALLBACK')
        expect(fallbackReceipt.success).toBe(true)
        expect(fallbackReceipt.outputDirectory).toBe('/local-goblin/ep01_sc03')
    })
})
