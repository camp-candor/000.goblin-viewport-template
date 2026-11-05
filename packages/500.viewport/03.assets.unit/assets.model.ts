import { StorageEnvelopeReceipt } from './fce/assets.interface';

export class AssetsModel {
  idx: string = '03.assets.unit';
  lastReceipt?: StorageEnvelopeReceipt;
  lastStatus: string = 'IDLE';
}
