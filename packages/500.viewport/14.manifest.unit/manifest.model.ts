import { ManifestReceipt } from './fce/manifest.interface';

export class ManifestModel {
  idx: string = '14.manifest.unit';
  lastReceipt?: ManifestReceipt;
  lastStatus: string = 'IDLE';
}
