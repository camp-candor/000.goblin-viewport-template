import * as Act from './seals.action';
import { SealsModel } from './seals.model';

export function sealsReducer(
  state: SealsModel = new SealsModel(),
  action: Act.SealsActions
): SealsModel {
  switch (action.type) {
    case Act.INIT_SEALS: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.EMIT_SEALED_COMPOSITION: {
      return { ...state, lastStatus: 'SEALED' };
    }
    default:
      return state;
  }
}
