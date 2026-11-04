import { BakeReceipt } from './fce/sourcebaking.interface';

export class SourceBakingModel {
  idx: string = '20.sourcebaking.unit';
  lastReceipt?: BakeReceipt;
  lastStatus: string = 'IDLE';
}
