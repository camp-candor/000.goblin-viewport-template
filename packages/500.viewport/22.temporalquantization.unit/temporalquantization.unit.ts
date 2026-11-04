import { TemporalquantizationModel } from './temporalquantization.model';
import { reducer } from './temporalquantization.reduce';
import * as Act from './temporalquantization.action';
import * as Buzz from './temporalquantization.buzzer';
import State from '../99.core/state'

export default class TemporalquantizationUnit {
  public model: TemporalquantizationModel = new TemporalquantizationModel();

  constructor(state: State) {}

  public reduce(
    state: TemporalquantizationModel,
    action: Act.Actions
  ): TemporalquantizationModel {
    return reducer(state, action);
  }

  public accumulateTimeline(ste: any, bale: any, bal: any): void {
    Buzz.runAccumulateTimelineBuzz(ste, bale, bal);
  }
}
