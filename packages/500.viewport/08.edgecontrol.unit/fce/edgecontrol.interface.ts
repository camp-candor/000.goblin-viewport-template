export type DispatchLifecycleStatus =
  | 'IDLE'
  | 'QUEUED'
  | 'DISPATCHED'
  | 'COMPILING'
  | 'SEALED'
  | 'FAILED';

export interface CompileEpisodeIntentPayload {
  readonly seriesSlug: string;
  readonly sceneId: string;
  readonly manifestPath: string;
  readonly astPath: string;
  readonly targetFrameBudget: number; // Integer 24fps budget
  readonly idempotencyKey: string;     // UUIDv7
  readonly requestedAtMs: number;      // Integer epoch timestamp
}

export interface DispatchReceipt {
  readonly receiptId: string;
  readonly sceneId: string;
  readonly idempotencyKey: string;
  readonly status: DispatchLifecycleStatus;
  readonly frameAllocation: number;
  readonly receiptHash: string;        // SHA-256
  readonly acknowledgedAtMs: number;
}

export interface DispatchErrorPayload {
  readonly sceneId: string;
  readonly idempotencyKey: string;
  readonly errorCode: 'INVALID_CONTRACT' | 'BUDGET_OVERFLOW' | 'REDUNDANT_DISPATCH';
  readonly message: string;
  readonly occurredAtMs: number;
}

export interface EdgeControlModel {
  readonly idx: string;
  readonly status: DispatchLifecycleStatus;
  readonly activeIntent: CompileEpisodeIntentPayload | null;
  readonly latestReceipt: DispatchReceipt | null;
  readonly errorHistory: readonly DispatchErrorPayload[];
  readonly monotonicSequence: number;
}

export default EdgeControlModel;
