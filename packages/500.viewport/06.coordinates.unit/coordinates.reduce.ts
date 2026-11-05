import * as Act from './coordinates.action';
import { CoordinatesModel } from './coordinates.model';

export function coordinatesReducer(
  state: CoordinatesModel = new CoordinatesModel(),
  action: Act.CoordinatesActions
): CoordinatesModel {
  switch (action.type) {
    case Act.INIT_COORDINATES: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.PARSE_VISUAL_MANIFEST: {
      return { ...state, lastStatus: 'MANIFEST_LOADED' };
    }
    case Act.RESOLVE_VARIANT: {
      return { ...state, lastStatus: 'VARIANT_RESOLVED' };
    }
    default:
      return state;
  }
}
