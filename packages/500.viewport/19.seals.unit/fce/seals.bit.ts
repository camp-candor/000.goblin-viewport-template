import { SealEmissionInput, SealsReceipt } from './seals.interface';

export interface SealsBit {
  idx: string;
  src?: string;
  val: number;
  dat?: {
    input?: SealEmissionInput;
    receipt?: SealsReceipt;
    error?: string;
  };
}
