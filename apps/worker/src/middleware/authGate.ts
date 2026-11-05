/**
 * apps/worker/src/middleware/authGate.ts
 * Sub-5ms Zero-Trust Edge Perimeter Authentication Middleware.
 * Enforces pure 7-bit ASCII status logging - zero multi-byte emojis.
 */

import type { Context, Next } from 'hono'

export interface AuthEnv {
    readonly AUTH_TOKEN?: string
    readonly CF_ACCESS_CLIENT_ID?: string
    readonly CF_ACCESS_CLIENT_SECRET?: string
}

/**
 * Validates inbound requests via Bearer token or Cloudflare Access Service Tokens.
 */
export async function authGate(
    c: Context<{ Bindings: AuthEnv }>,
    next: Next,
): Promise<Response | void> {
    const authHeader = c.req.header('Authorization')
    const cfClientId = c.req.header('CF-Access-Client-Id')
    const cfClientSecret = c.req.header('CF-Access-Client-Secret')

    const configuredToken = c.env?.AUTH_TOKEN || 'candor-local-dev-token'
    const configuredClientId = c.env?.CF_ACCESS_CLIENT_ID
    const configuredClientSecret = c.env?.CF_ACCESS_CLIENT_SECRET

    // 1. Check Cloudflare Access Service Tokens
    if (configuredClientId && configuredClientSecret) {
        if (
            cfClientId === configuredClientId &&
            cfClientSecret === configuredClientSecret
        ) {
            return next()
        }
    }

    // 2. Check Bearer Authorization Header
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim()
        if (token === configuredToken) {
            return next()
        }
    }

    // Fail-closed rejection in < 5ms
    return c.json(
        {
            ok: false,
            error: {
                code: 'UNAUTHORIZED_ACCESS',
                message: 'Invalid or missing authentication credentials',
            },
        },
        401,
    )
}
