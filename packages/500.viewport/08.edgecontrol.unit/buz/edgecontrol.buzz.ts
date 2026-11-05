
import { createHash } from 'node:crypto';
import type {
  CompileEpisodeIntentPayload,
  DispatchReceipt,
  DispatchErrorPayload,
} from '../fce/edgecontrol.interface.js';

export function validateCompileIntent(
  payload: CompileEpisodeIntentPayload
): { valid: boolean; error?: string } {
  if (!payload.seriesSlug || payload.seriesSlug.trim() === '') {
    return { valid: false, error: 'MISSING_SERIES_SLUG' };
  }
  if (!payload.sceneId || !/^ep\d+_sc\d+$/.test(payload.sceneId)) {
    return { valid: false, error: 'INVALID_SCENE_ID_FORMAT' };
  }
  if (!payload.manifestPath || !payload.astPath) {
    return { valid: false, error: 'MISSING_CONTRACT_PATHS' };
  }
  if (!Number.isInteger(payload.targetFrameBudget) || payload.targetFrameBudget <= 0) {
    return { valid: false, error: 'INVALID_INTEGER_FRAME_BUDGET' };
  }
  return { valid: true };
}

export function synthesizeReceipt(
  intent: CompileEpisodeIntentPayload
): DispatchReceipt {
  const rawDigest = `${intent.seriesSlug}:${intent.sceneId}:${intent.targetFrameBudget}:${intent.idempotencyKey}`;
  const receiptHash = createHash('sha256').update(rawDigest, 'utf8').digest('hex');

  return {
    receiptId: `rcpt_${intent.sceneId}_${Date.now()}`,
    sceneId: intent.sceneId,
    idempotencyKey: intent.idempotencyKey,
    status: 'QUEUED',
    frameAllocation: intent.targetFrameBudget,
    receiptHash,
    acknowledgedAtMs: Date.now(),
  };
}

export function formatAsciiTelemetry(
  tag: string,
  sceneId: string,
  message: string
): string {
  // Pure 7-bit ASCII output enforcement
  return `>> [EDGE:${tag}] [${sceneId}] ${message}`;
}
