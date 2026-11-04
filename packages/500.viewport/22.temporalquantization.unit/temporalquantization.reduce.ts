import * as Act from './temporalquantization.action';
import { TemporalquantizationModel } from './temporalquantization.model';

export function reducer(
  model: TemporalquantizationModel = new TemporalquantizationModel(),
  act: Act.Actions,
  state?: any
): TemporalquantizationModel {
  switch (act.type) {
    case Act.INIT_TEMPORALQUANTIZATION: {
      return { ...model, lastStatus: 'INITIALIZED' };
    }
    case Act.ACCUMULATE_TIMELINE: {
      return { ...model, lastStatus: 'QUANTIZED' };
    }
    default:
      return model;
  }
}
