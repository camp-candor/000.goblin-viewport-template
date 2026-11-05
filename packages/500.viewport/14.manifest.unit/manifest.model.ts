import { ManifestReceipt } from './fce/manifest.interface';

export default class ManifestModel {
  idx: string = '14.manifest.unit';
  lastReceipt?: ManifestReceipt;
  lastStatus: string = 'IDLE';
}
