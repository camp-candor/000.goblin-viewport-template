import TemporalquantizationBit from './fce/temporalquantization.bit';
import { QuantizationManifestReceipt } from './fce/temporalquantization.interface';

export class TemporalquantizationModel implements TemporalquantizationBit {
  idx: string = '22.temporalquantization.unit';
  lastReceipt?: QuantizationManifestReceipt;
  lastStatus: string = 'IDLE';
}
