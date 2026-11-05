import { createHash } from 'node:crypto'
import type {
    CompileEpisodeIntentPayload,
    DispatchReceipt,
    DispatchErrorPayload,
} from '../fce/edgecontrol.interface.js'
import { edgeControlReducer } from '../edgecontrol.reduce.js'
import { dispatchCompileEpisode } from '../edgecontrol.action.js'
import { INITIAL_EDGE_CONTROL_STATE } from '../../96.model.unit/fce/dispatch-state.interface.js'

export function validateCompileIntent(payload: CompileEpisodeIntentPayload): {
    valid: boolean
    error?: string
} {
    if (!payload.seriesSlug || payload.seriesSlug.trim() === '') {
        return { valid: false, error: 'MISSING_SERIES_SLUG' }
    }
    if (!payload.sceneId || !/^ep\d+_sc\d+$/.test(payload.sceneId)) {
        return { valid: false, error: 'INVALID_SCENE_ID_FORMAT' }
    }
    if (!payload.manifestPath || !payload.astPath) {
        return { valid: false, error: 'MISSING_CONTRACT_PATHS' }
    }
    if (
        !Number.isInteger(payload.targetFrameBudget) ||
        payload.targetFrameBudget <= 0
    ) {
        return { valid: false, error: 'INVALID_INTEGER_FRAME_BUDGET' }
    }
    return { valid: true }
}

export function synthesizeReceipt(
    intent: CompileEpisodeIntentPayload,
): DispatchReceipt {
    const rawDigest = `${intent.seriesSlug}:${intent.sceneId}:${intent.targetFrameBudget}:${intent.idempotencyKey}`
    const receiptHash = createHash('sha256')
        .update(rawDigest, 'utf8')
        .digest('hex')

    return {
        receiptId: `rcpt_${intent.sceneId}_${Date.now()}`,
        sceneId: intent.sceneId,
        idempotencyKey: intent.idempotencyKey,
        status: 'QUEUED',
        frameAllocation: intent.targetFrameBudget,
        receiptHash,
        acknowledgedAtMs: Date.now(),
    }
}

export function formatAsciiTelemetry(
    tag: string,
    sceneId: string,
    message: string,
): string {
    // Pure 7-bit ASCII output enforcement
    return `>> [EDGE:${tag}] [${sceneId}] ${message}`
}

export async function runEdgeDispatchGatewayJourney(ste: any): Promise<void> {
    const lib = (globalThis as any).LIBRARY
    const payload: CompileEpisodeIntentPayload = {
        seriesSlug: 'under-the-floorboards',
        sceneId: 'ep01_sc03',
        manifestPath: '/data/manifests/ep01_sc03.json',
        astPath: '/data/ast/ep01_sc03.ast.json',
        targetFrameBudget: 72,
        idempotencyKey: '018f67b5-1234-7000-8000-000000000001',
        requestedAtMs: 1714500000000,
    }
    const emit = async (line: string): Promise<void> => {
        if (lib && typeof lib.hunt === 'function') {
            await lib.hunt('[Console action] Update Console', {
                idx: 'cns00',
                src: line,
            })
        }
    }
    const check = validateCompileIntent(payload)
    if (!check.valid) {
        await emit(
            formatAsciiTelemetry(
                'ERROR',
                payload.sceneId,
                'Intent rejected: ' + (check.error || 'UNKNOWN'),
            ),
        )
        return
    }
    await emit(
        formatAsciiTelemetry('INGEST', payload.sceneId, 'Intent validated'),
    )
    const receipt = synthesizeReceipt(payload)
    await emit(
        formatAsciiTelemetry(
            'RECEIPT',
            payload.sceneId,
            'Hash generated: ' + receipt.receiptHash + ' [OK]',
        ),
    )
    const next = edgeControlReducer(
        INITIAL_EDGE_CONTROL_STATE,
        dispatchCompileEpisode(payload),
    )
    await emit(
        formatAsciiTelemetry(
            'STATUS',
            payload.sceneId,
            'Status: ' +
                receipt.status +
                ' (seq: ' +
                next.monotonicSequence +
                ')',
        ),
    )
}
