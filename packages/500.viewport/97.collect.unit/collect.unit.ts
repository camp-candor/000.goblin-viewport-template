import { CollectModel } from './collect.model';
import { collectReducer } from './collect.reduce';
import * as Act from './collect.action';
import * as Buzz from './collect.buzzer';

export class CollectUnit {
  public model: CollectModel = new CollectModel();

  public reduce(state: CollectModel, action: Act.CollectActions): CollectModel {
    return collectReducer(state, action);
  }

  public harvestEpisodeAssets(ste: any, bale: any, bal: any): void {
    Buzz.runHarvestEpisodeAssetsBuzz(ste, bale, bal);
  }
}
