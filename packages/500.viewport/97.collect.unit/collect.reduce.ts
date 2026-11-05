import * as Act from './collect.action';
import { CollectModel } from './collect.model';

export function collectReducer(
  state: CollectModel = new CollectModel(),
  action: Act.CollectActions
): CollectModel {
  switch (action.type) {
    case Act.INIT_COLLECT: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.HARVEST_EPISODE_ASSETS: {
      return { ...state, lastStatus: 'HARVESTED' };
    }
    default:
      return state;
  }
}
