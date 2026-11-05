import * as Act from './assets.action';
import { AssetsModel } from './assets.model';

export function assetsReducer(
  state: AssetsModel = new AssetsModel(),
  action: Act.AssetsActions
): AssetsModel {
  switch (action.type) {
    case Act.INIT_ASSETS: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.AUDIT_STORAGE_ENVELOPE: {
      return { ...state, lastStatus: 'AUDITED' };
    }
    default:
      return state;
  }
}
