/**
 * apps/worker/test/unit/honoGateway.test.ts
 * Vitest verification suite for Hono routing gateway, authGate, and compile endpoint.
 */

import { describe, it, expect } from 'vitest'
import app, { type Env } from '../../src/index.js'

describe('Phase 5 Cloudflare Edge Hono Routing Gateway', () => {
    const env: Env = {
        AUTH_TOKEN: 'test-secret-token-123',
        CF_ACCESS_CLIENT_ID: 'cf-test-client-id',
        CF_ACCESS_CLIENT_SECRET: 'cf-test-client-secret',
    }

    const validPayload = {
        seriesSlug: 'under-the-floorboards',
        sceneId: 'ep01_sc03',
        manifestPath: '/data/manifests/ep01_sc03.json',
        astPath: '/data/ast/ep01_sc03.ast.json',
        targetFrameBudget: 72,
    }

    it('serves public zero-auth healthcheck with HTTP 200', async () => {
        const res = await app.request('/health')
        expect(res.status).toBe(200)
        const body = (await res.json()) as any
        expect(body.status).toBe('ONLINE')
        expect(body.runtime).toBe('cloudflare-workers')
    })

    it('rejects unauthenticated requests to /api/compile with HTTP 401', async () => {
        const res = await app.request(
            '/api/compile',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validPayload),
            },
            env,
        )

        expect(res.status).toBe(401)
        const body = (await res.json()) as any
        expect(body.ok).toBe(false)
        expect(body.error?.code).toBe('UNAUTHORIZED_ACCESS')
    })

    it('authenticates successfully via Bearer token and returns HTTP 202', async () => {
        const res = await app.request(
            '/api/compile',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-secret-token-123',
                },
                body: JSON.stringify(validPayload),
            },
            env,
        )

        expect(res.status).toBe(202)
        const body = (await res.json()) as any
        expect(body.ok).toBe(true)
        expect(body.status).toBe(202)
        expect(body.receipt?.sceneId).toBe('ep01_sc03')
        expect(body.receipt?.status).toBe('QUEUED')
    })

    it('authenticates successfully via Cloudflare Access Service Token headers', async () => {
        const res = await app.request(
            '/api/compile',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CF-Access-Client-Id': 'cf-test-client-id',
                    'CF-Access-Client-Secret': 'cf-test-client-secret',
                },
                body: JSON.stringify(validPayload),
            },
            env,
        )

        expect(res.status).toBe(202)
        const body = (await res.json()) as any
        expect(body.ok).toBe(true)
        expect(body.receipt?.jobId).toBeDefined()
    })

    it('rejects payloads with undeclared properties with HTTP 400', async () => {
        const roguePayload = {
            ...validPayload,
            undeclaredProperty: 'malicious_key',
        }

        const res = await app.request(
            '/api/compile',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-secret-token-123',
                },
                body: JSON.stringify(roguePayload),
            },
            env,
        )

        expect(res.status).toBe(400)
        const body = (await res.json()) as any
        expect(body.ok).toBe(false)
        expect(body.error?.code).toBe('INVALID_PAYLOAD_STRUCTURE')
    })

    it('rejects command injection attacks in manifestPath with HTTP 400', async () => {
        const hostilePayload = {
            ...validPayload,
            manifestPath: '/data/manifests/ep01.json; rm -rf /',
        }

        const res = await app.request(
            '/api/compile',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-secret-token-123',
                },
                body: JSON.stringify(hostilePayload),
            },
            env,
        )

        expect(res.status).toBe(400)
        const body = (await res.json()) as any
        expect(body.ok).toBe(false)
        expect(body.error?.code).toBe('FORBIDDEN_COMMAND_INJECTION')
    })

    it('returns HTTP 404 for undefined paths', async () => {
        const res = await app.request('/undefined-route', {
            method: 'GET',
        })
        expect(res.status).toBe(404)
        const body = (await res.json()) as any
        expect(body.error?.code).toBe('NOT_FOUND')
    })
})
