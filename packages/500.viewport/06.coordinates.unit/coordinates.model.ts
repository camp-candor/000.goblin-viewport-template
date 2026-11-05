import { VisualAssetManifest, CoordinatesReceipt } from './fce/coordinates.interface';

export class CoordinatesModel {
  idx: string = '06.coordinates.unit';
  activeManifest?: VisualAssetManifest;
  lastReceipt?: CoordinatesReceipt;
  lastStatus: string = 'IDLE';
}
