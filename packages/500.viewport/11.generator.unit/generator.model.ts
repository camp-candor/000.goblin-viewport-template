import { GeneratorParams, ScaffoldingReceipt } from './fce/generator.interface';

export class GeneratorModel {
  idx: string = '11.generator.unit';
  activeParams?: GeneratorParams;
  lastReceipt?: ScaffoldingReceipt;
  lastStatus: string = 'IDLE';
}
