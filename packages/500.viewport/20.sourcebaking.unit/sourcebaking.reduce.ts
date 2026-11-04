import * as Act from './sourcebaking.action';
import { SourceBakingModel } from './sourcebaking.model';

export function sourceBakingReducer(
  state: SourceBakingModel = new SourceBakingModel(),
  action: Act.SourceBakingActions
): SourceBakingModel {
  switch (action.type) {
    case Act.INIT_SOURCE_BAKING: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.BAKE_STATIC_COMPOSITION: {
      return { ...state, lastStatus: 'BAKED' };
    }
    default:
      return state;
  }
}
