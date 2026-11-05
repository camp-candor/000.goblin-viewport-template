import * as Act from './manifest.action';
import { ManifestModel } from './manifest.model';

export function manifestReducer(
  state: ManifestModel = new ManifestModel(),
  action: Act.ManifestActions
): ManifestModel {
  switch (action.type) {
    case Act.INIT_MANIFEST: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.MINT_PROVENANCE_LOCKFILE: {
      return { ...state, lastStatus: 'LOCKED' };
    }
    default:
      return state;
  }
}
