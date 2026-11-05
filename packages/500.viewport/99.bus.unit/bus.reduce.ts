import * as Act from './bus.action.js'
import { BusModel } from './bus.model.js'

export function busReducer(
    state: BusModel = new BusModel(),
    action: Act.BusActions,
): BusModel {
    switch (action.type) {
        case Act.INIT_BUS: {
            return { ...state }
        }
        case Act.ROUTE_TELEMETRY: {
            return {
                ...state,
                totalLogsRouted: state.totalLogsRouted + 1,
                lastMessage: action.bale.src || state.lastMessage,
            }
        }
        default:
            return state
    }
}

export const reducer = busReducer
export default busReducer
