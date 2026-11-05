import type { EdgeControlModel } from './fce/edgecontrol.interface.js';
import type { EdgeControlActions } from './edgecontrol.action.js';
import {
  INIT_EDGE_CONTROL,
  DISPATCH_COMPILE_EPISODE,
  RECEIVE_DISPATCH_RECEIPT,
  HANDLE_DISPATCH_ERROR,
  RESET_DISPATCH_STATE,
} from './edgecontrol.action.js';
import { INITIAL_EDGE_CONTROL_STATE } from '../96.model.unit/fce/dispatch-state.interface.js';

export function edgeControlReducer(
  state: EdgeControlModel = INITIAL_EDGE_CONTROL_STATE,
  action?: EdgeControlActions
): EdgeControlModel {
  if (!action) return state;

  switch (action.type) {
    case INIT_EDGE_CONTROL: {
      return Object.freeze({
        ...state,
        status: 'IDLE',
      });
    }

    case DISPATCH_COMPILE_EPISODE: {
      return Object.freeze({
        ...state,
        status: 'DISPATCHED',
        activeIntent: action.payload,
        monotonicSequence: state.monotonicSequence + 1,
      });
    }

    case RECEIVE_DISPATCH_RECEIPT: {
      return Object.freeze({
        ...state,
        status: action.payload.status,
        latestReceipt: action.payload,
        monotonicSequence: state.monotonicSequence + 1,
      });
    }

    case HANDLE_DISPATCH_ERROR: {
      return Object.freeze({
        ...state,
        status: 'FAILED',
        errorHistory: Object.freeze([...state.errorHistory, action.payload]),
        monotonicSequence: state.monotonicSequence + 1,
      });
    }

    case RESET_DISPATCH_STATE: {
      return Object.freeze({
        ...INITIAL_EDGE_CONTROL_STATE,
        monotonicSequence: state.monotonicSequence + 1,
      });
    }

    default:
      return state;
  }
}

export const reducer = edgeControlReducer;
