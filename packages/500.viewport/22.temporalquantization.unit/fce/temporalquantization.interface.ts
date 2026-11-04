export interface ShotDurationInput {
  shotId: string;
  durationMs: number;
}

export interface QuantizedShot {
  shotId: string;
  durationMs: number;
  targetFrames: number;
  startFrame: number;
  endFrame: number;
  tailSlackMs: number;
}

export interface CausalLatticeOutput {
  targetFrames: number;
  diffusionFrames: number;
  trimEndFrames: number;
  latticeIndex: number;
}

export interface QuantizationManifestReceipt {
  status: 'SUCCESS' | 'ERROR';
  totalDurationMs: number;
  totalFrames: number;
  maxDriftMs: number;
  shots: QuantizedShot[];
  errorMessage?: string;
}

export interface Temporalquantization {}
export interface TemporalquantizationState {
    idx: string;
}
