
import { describe, it, expect, beforeEach } from 'vitest';
import { edgeControlReducer } from '../08.edgecontrol.unit/edgecontrol.reduce.js';
import {
  dispatchCompileEpisode,
  receiveDispatchReceipt,
  handleDispatchError,
  resetDispatchState,
} from '../08.edgecontrol.unit/edgecontrol.action.js';
import {
  validateCompileIntent,
  synthesizeReceipt,
  formatAsciiTelemetry,
} from '../08.edgecontrol.unit/buz/edgecontrol.buzz.js';
import { INITIAL_EDGE_CONTROL_STATE } from '../96.model.unit/fce/dispatch-state.interface.js';
import type { CompileEpisodeIntentPayload } from '../08.edgecontrol.unit/fce/edgecontrol.interface.js';

describe('Phase 1 Local Dispatch Contract Ingestion Architecture', () => {
  let validPayload: CompileEpisodeIntentPayload;

  beforeEach(() => {
    validPayload = {
      seriesSlug: 'under-the-floorboards',
      sceneId: 'ep01_sc03',
      manifestPath: '/data/manifests/ep01_sc03.json',
      astPath: '/data/ast/ep01_sc03.ast.json',
      targetFrameBudget: 72,
      idempotencyKey: '018f67b5-1234-7000-8000-000000000001',
      requestedAtMs: 1714500000000,
    };
  });

  it('validates compliant compile episode intents with zero exceptions', () => {
    const check = validateCompileIntent(validPayload);
    expect(check.valid).toBe(true);
    expect(check.error).toBeUndefined();
  });

  it('rejects malformed sceneId identifiers that violate naming conventions', () => {
    const invalid = { ...validPayload, sceneId: 'invalid_scene_format' };
    const check = validateCompileIntent(invalid);
    expect(check.valid).toBe(false);
    expect(check.error).toBe('INVALID_SCENE_ID_FORMAT');
  });

  it('rejects non-integer or zero frame budget allocations', () => {
    const nonInt = { ...validPayload, targetFrameBudget: 72.5 };
    const zeroBudget = { ...validPayload, targetFrameBudget: 0 };
    expect(validateCompileIntent(nonInt).valid).toBe(false);
    expect(validateCompileIntent(zeroBudget).valid).toBe(false);
  });

  it('synthesizes a deterministic SHA-256 dispatch receipt', () => {
    const receipt = synthesizeReceipt(validPayload);
    expect(receipt.sceneId).toBe(validPayload.sceneId);
    expect(receipt.idempotencyKey).toBe(validPayload.idempotencyKey);
    expect(receipt.frameAllocation).toBe(72);
    expect(receipt.receiptHash).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.status).toBe('QUEUED');
  });

  it('advances reducer state immutably without in-place mutation', () => {
    const s0 = INITIAL_EDGE_CONTROL_STATE;
    const s1 = edgeControlReducer(s0, dispatchCompileEpisode(validPayload));

    expect(s1.status).toBe('DISPATCHED');
    expect(s1.activeIntent).toEqual(validPayload);
    expect(s1.monotonicSequence).toBe(1);
    expect(s0.status).toBe('IDLE'); // Unmutated root

    const receipt = synthesizeReceipt(validPayload);
    const s2 = edgeControlReducer(s1, receiveDispatchReceipt(receipt));
    expect(s2.status).toBe('QUEUED');
    expect(s2.latestReceipt).toEqual(receipt);
    expect(s2.monotonicSequence).toBe(2);

    const s3 = edgeControlReducer(s2, resetDispatchState());
    expect(s3.status).toBe('IDLE');
    expect(s3.activeIntent).toBeNull();
    expect(s3.monotonicSequence).toBe(3);
  });

  it('formats status streams strictly to 7-bit ASCII standards', () => {
    const msg = formatAsciiTelemetry('INGEST_OK', validPayload.sceneId, 'Intent validated');
    expect(/^[\x00-\x7F]+$/.test(msg)).toBe(true);
    expect(msg).toContain('>> [EDGE:INGEST_OK] [ep01_sc03] Intent validated');
  });
});
