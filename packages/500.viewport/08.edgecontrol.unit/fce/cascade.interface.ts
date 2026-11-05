/**
 * Phase 2 Local Endpoint Resolution Cascade Engine Contracts
 * Pure TypeScript definitions enforcing zero-cache dynamic resolution.
 */

export type CascadeTier =
    'SWITCHBOARD' | 'PACKAGE_OVERRIDE' | 'ENV_CONFIG' | 'LOCAL_DEFAULT'

export interface EndpointResolutionReceipt {
    readonly resolvedUrl: string
    readonly resolvedWsUrl: string
    readonly sourceTier: CascadeTier
    readonly evaluatedAtMs: number
}

export interface HttpDispatchOptions {
    readonly endpointPath: string
    readonly method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    readonly payload?: unknown
    readonly headers?: Record<string, string>
    readonly timeoutMs?: number // Defaults to 5000ms
}

export interface HttpDispatchReceipt<T = unknown> {
    readonly ok: boolean
    readonly status: number
    readonly data?: T
    readonly error?: {
        readonly code:
            | 'REQUEST_TIMEOUT'
            | 'CONNECTION_REFUSED'
            | 'DIRTY_SCENE_REJECTED'
            | 'ZOMBIE_LEASE_EPOCH'
            | 'EDGE_GATEWAY_UNAVAILABLE'
            | 'DISPATCH_ERROR'
        readonly message: string
    }
    readonly roundTripTimeMs: number
    readonly targetUrl: string
}

export interface ContinuityExecutionReceipt {
    readonly executionMode: 'EDGE_REMOTE' | 'LOCAL_IN_PROCESS_FALLBACK'
    readonly targetUrl: string
    readonly success: boolean
    readonly outputDirectory?: string
    readonly error?: string
    readonly latencyMs: number
}
