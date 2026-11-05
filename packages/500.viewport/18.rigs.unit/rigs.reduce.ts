import * as Act from './rigs.action';
import { RigsModel } from './rigs.model';

export function rigsReducer(
  state: RigsModel = new RigsModel(),
  action: Act.RigsActions
): RigsModel {
  switch (action.type) {
    case Act.INIT_RIGS: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.VENDOR_PRESENTATION_RIGS: {
      return { ...state, lastStatus: 'VENDORED' };
    }
    default:
      return state;
  }
}
