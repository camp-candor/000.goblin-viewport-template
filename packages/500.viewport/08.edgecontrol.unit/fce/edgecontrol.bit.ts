
/**
 * Candor Bit contract for asynchronous operational dispatch across bus units.
 */
export interface EdgeControlBit {
  readonly idx: string;
  readonly src?: string;
  readonly val?: number;
  readonly dat?: any;
  readonly slv?: (value: any) => void;
}
