import { Temporalquantization } from './fce/temporalquantization.interface';
import { TemporalquantizationState } from './fce/temporalquantization.interface';
import { QuantizationManifestReceipt } from './fce/temporalquantization.interface';

export class TemporalquantizationModel implements TemporalquantizationState {
    idx: string = '22.temporalquantization.unit';
    lastReceipt?: QuantizationManifestReceipt;
    lastStatus: string = 'IDLE';
}
