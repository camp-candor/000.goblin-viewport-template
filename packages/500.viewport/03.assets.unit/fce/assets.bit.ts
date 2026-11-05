import { StorageEnvelopeReceipt } from './assets.interface';

export interface AssetsBit {
  idx: string;
  src?: string;
  val: number;
  dat?: {
    targetDir?: string;
    receipt?: StorageEnvelopeReceipt;
    error?: string;
  };
}
