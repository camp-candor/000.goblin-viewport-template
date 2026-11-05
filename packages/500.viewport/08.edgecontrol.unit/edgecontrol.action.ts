import type {
  CompileEpisodeIntentPayload,
  DispatchReceipt,
  DispatchErrorPayload,
} from './fce/edgecontrol.interface.js';

export const INIT_EDGE_CONTROL = '[EdgeControl Action] Init';
export const DISPATCH_COMPILE_EPISODE = '[EdgeControl Action] Dispatch Compile Episode';
export const RECEIVE_DISPATCH_RECEIPT = '[EdgeControl Action] Receive Dispatch Receipt';
export const HANDLE_DISPATCH_ERROR = '[EdgeControl Action] Handle Dispatch Error';
export const RESET_DISPATCH_STATE = '[EdgeControl Action] Reset State';

export interface InitEdgeControlAction {
  readonly type: typeof INIT_EDGE_CONTROL;
}

export interface DispatchCompileEpisodeAction {
  readonly type: typeof DISPATCH_COMPILE_EPISODE;
  readonly payload: CompileEpisodeIntentPayload;
}

export interface ReceiveDispatchReceiptAction {
  readonly type: typeof RECEIVE_DISPATCH_RECEIPT;
  readonly payload: DispatchReceipt;
}

export interface HandleDispatchErrorAction {
  readonly type: typeof HANDLE_DISPATCH_ERROR;
  readonly payload: DispatchErrorPayload;
}

export interface ResetDispatchStateAction {
  readonly type: typeof RESET_DISPATCH_STATE;
}

export type EdgeControlActions =
  | InitEdgeControlAction
  | DispatchCompileEpisodeAction
  | ReceiveDispatchReceiptAction
  | HandleDispatchErrorAction
  | ResetDispatchStateAction;

export const initEdgeControl = (): InitEdgeControlAction => ({
  type: INIT_EDGE_CONTROL,
});

export const dispatchCompileEpisode = (
  payload: CompileEpisodeIntentPayload
): DispatchCompileEpisodeAction => ({
  type: DISPATCH_COMPILE_EPISODE,
  payload,
});

export const receiveDispatchReceipt = (
  payload: DispatchReceipt
): ReceiveDispatchReceiptAction => ({
  type: RECEIVE_DISPATCH_RECEIPT,
  payload,
});

export const handleDispatchError = (
  payload: DispatchErrorPayload
): HandleDispatchErrorAction => ({
  type: HANDLE_DISPATCH_ERROR,
  payload,
});

export const resetDispatchState = (): ResetDispatchStateAction => ({
  type: RESET_DISPATCH_STATE,
});
