import { ShotDurationInput, QuantizationManifestReceipt, CausalLatticeOutput } from './temporalquantization.interface';

export interface TemporalquantizationBit {
  idx: string;
  src?: string;
  val: number;
  dat?: {
    shots?: ShotDurationInput[];
    targetFrames?: number;
    receipt?: QuantizationManifestReceipt;
    lattice?: CausalLatticeOutput;
    error?: string;
  };
}

export default TemporalquantizationBit;
