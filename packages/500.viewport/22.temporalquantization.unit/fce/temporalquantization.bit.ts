import { ShotDurationInput, QuantizationManifestReceipt, CausalLatticeOutput } from './temporalquantization.interface';

export default interface TemporalquantizationBit {
  idx: string;
  src?: string;
  val?: number;
  slv?: Function;
  dat?: {
    shots?: ShotDurationInput[];
    targetFrames?: number;
    receipt?: QuantizationManifestReceipt;
    lattice?: CausalLatticeOutput;
    error?: string;
  };
}
