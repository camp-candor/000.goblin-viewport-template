/**
 * apps/worker/src/routes/compileRoutes.ts
 * Hono Compilation REST Sub-Router.
 * Exposes POST /api/compile with TypeBox validation and non-blocking waitUntil.
 */

import { Hono } from 'hono'
import { Value } from '@sinclair/typebox/value'
import {
    CompileEpisodeSchema,
    type CompileEpisodePayload,
} from '../tools.custom.js'
import { sanitizePath, sanitizeSlug } from '../lib/sanitizer.js'

export const compileRoutes = new Hono<{ Bindings: Record<string, unknown> }>()

compileRoutes.post('/', async (c) => {
    const t0 = Date.now()
    let rawBody: unknown

    try {
        rawBody = await c.req.json()
    } catch {
        return c.json(
            {
                ok: false,
                error: {
                    code: 'MALFORMED_JSON_PAYLOAD',
                    message: 'Request body must be valid JSON',
                },
            },
            400,
        )
    }

    // 1. Strict TypeBox Structural Validation (Value.Check avoids new Function / unsafe-eval)
    if (!Value.Check(CompileEpisodeSchema, rawBody)) {
        const errors = [...Value.Errors(CompileEpisodeSchema, rawBody)]
        const firstError = errors[0]
        const message = firstError
            ? `Validation failed at '${firstError.path}': ${firstError.message}`
            : 'Invalid payload structure'

        return c.json(
            {
                ok: false,
                error: {
                    code: 'INVALID_PAYLOAD_STRUCTURE',
                    message,
                },
            },
            400,
        )
    }

    const payload = rawBody as CompileEpisodePayload

    // 2. Path Traversal & Command Injection Defense
    const manifestCheck = sanitizePath(payload.manifestPath)
    if (!manifestCheck.valid) {
        return c.json(
            {
                ok: false,
                error: {
                    code:
                        manifestCheck.errorCode ||
                        'FORBIDDEN_COMMAND_INJECTION',
                    message:
                        manifestCheck.message ||
                        'Manifest path security check failed',
                },
            },
            400,
        )
    }

    const astCheck = sanitizePath(payload.astPath)
    if (!astCheck.valid) {
        return c.json(
            {
                ok: false,
                error: {
                    code: astCheck.errorCode || 'FORBIDDEN_COMMAND_INJECTION',
                    message:
                        astCheck.message || 'AST path security check failed',
                },
            },
            400,
        )
    }

    const sceneCheck = sanitizeSlug(payload.sceneId, /^ep[0-9]+_sc[0-9]+$/)
    if (!sceneCheck.valid) {
        return c.json(
            {
                ok: false,
                error: {
                    code: sceneCheck.errorCode || 'FORBIDDEN_COMMAND_INJECTION',
                    message: 'Malformed scene identifier format',
                },
            },
            400,
        )
    }

    // 3. Synthesize Immutable Dispatch Receipt
    const acknowledgedAtMs = Date.now()
    const receipt = {
        jobId: `job_${payload.sceneId}_${acknowledgedAtMs}`,
        seriesSlug: payload.seriesSlug,
        sceneId: payload.sceneId,
        manifestPath: manifestCheck.sanitizedValue,
        astPath: astCheck.sanitizedValue,
        targetFrameBudget: payload.targetFrameBudget ?? null,
        status: 'QUEUED',
        acknowledgedAtMs,
        latencyMs: acknowledgedAtMs - t0,
    }

    // 4. Non-Blocking Execution via ctx.waitUntil (Acknowledges in < 10ms)
    try {
        if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
            c.executionCtx.waitUntil(
                (async () => {
                    // Simulates async dispatch signaling without holding the HTTP response
                    await new Promise((resolve) => setTimeout(resolve, 5))
                })(),
            )
        }
    } catch {
        // Graceful fallback when running in environments without ExecutionContext (e.g. synthetic app.request tests)
    }

    return c.json(
        {
            ok: true,
            status: 202,
            receipt,
        },
        202,
    )
})
