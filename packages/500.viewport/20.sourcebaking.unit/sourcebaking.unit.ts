import { SourceBakingModel } from './sourcebaking.model';
import { sourceBakingReducer } from './sourcebaking.reduce';
import * as Act from './sourcebaking.action';
import * as Buzz from './sourcebaking.buzzer';

export class SourceBakingUnit {
  public model: SourceBakingModel = new SourceBakingModel();

  public reduce(state: SourceBakingModel, action: Act.SourceBakingActions): SourceBakingModel {
    return sourceBakingReducer(state, action);
  }

  public bakeStaticComposition(ste: any, bale: any, bal: any): void {
    Buzz.runBakeStaticCompositionBuzz(ste, bale, bal);
  }
}
