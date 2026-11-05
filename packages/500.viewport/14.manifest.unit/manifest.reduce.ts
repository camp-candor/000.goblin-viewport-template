import * as Act from './manifest.action';
import ManifestModel from './manifest.model';

export function reducer(
  state: ManifestModel = new ManifestModel(),
  action: Act.Actions
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
