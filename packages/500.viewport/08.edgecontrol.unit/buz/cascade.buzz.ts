import type {
    CascadeTier,
    EndpointResolutionReceipt,
} from '../fce/cascade.interface.js'

export const CANONICAL_LOCAL_LOOPBACK = 'http://127.0.0.1:8787'

/**
 * 4-Tier Dynamic Resolution Cascade
 * Evaluated synchronously on every invocation. NEVER cache the returned value.
 */
export function resolveCoordinationEndpoint(): EndpointResolutionReceipt {
    const evaluatedAtMs = Date.now()
    let resolvedUrl: string
    let sourceTier: CascadeTier

    // Tier 1: Active switchboard runtime pointer (Blessed TUI / global pointer)
    const switchboardUrl = (globalThis as any).agentBaseUrl
    if (
        typeof switchboardUrl === 'string' &&
        switchboardUrl.trim().length > 0
    ) {
        resolvedUrl = switchboardUrl.trim().replace(/\/+$/, '')
        sourceTier = 'SWITCHBOARD'
    }
    // Tier 2: Domain/package programmatic override for isolated test suites
    else {
        const packageOverride = (globalThis as any).packageBaseUrl
        if (
            typeof packageOverride === 'string' &&
            packageOverride.trim().length > 0
        ) {
            resolvedUrl = packageOverride.trim().replace(/\/+$/, '')
            sourceTier = 'PACKAGE_OVERRIDE'
        }
        // Tier 3: Ambient process environment
        else {
            const envUrl =
                process.env.LIVE_WORKER_URL ||
                process.env.WORKER_URL ||
                process.env.LOCAL_WORKER_URL

            if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
                resolvedUrl = envUrl.trim().replace(/\/+$/, '')
                sourceTier = 'ENV_CONFIG'
            }
            // Tier 4: Canonical local loopback default (fail-safe sovereign anchor)
            else {
                resolvedUrl = CANONICAL_LOCAL_LOOPBACK
                sourceTier = 'LOCAL_DEFAULT'
            }
        }
    }

    // Synchronous WebSocket protocol derivation
    const resolvedWsUrl = resolvedUrl.startsWith('https://')
        ? resolvedUrl.replace(/^https:\/\//, 'wss://')
        : resolvedUrl.replace(/^http:\/\//, 'ws://')

    return {
        resolvedUrl,
        resolvedWsUrl,
        sourceTier,
        evaluatedAtMs,
    }
}

export function setRuntimeEndpoint(url: string): string {
    const sanitized = url.trim().replace(/\/+$/, '')
    ;(globalThis as any).agentBaseUrl = sanitized
    process.stdout.write(
        `>> [CASCADE] [OK] Runtime switchboard set to: ${sanitized}\n`,
    )
    return sanitized
}

export function clearRuntimeEndpoint(): void {
    delete (globalThis as any).agentBaseUrl
    process.stdout.write(
        '>> [CASCADE] [OK] Runtime switchboard reset to cascade default.\n',
    )
}
