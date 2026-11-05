import * as Act from './optical.action'
import { OpticalModel } from './optical.model'

export function opticalReducer(
    state: OpticalModel = new OpticalModel(),
    action: Act.OpticalActions,
): OpticalModel {
    switch (action.type) {
        case Act.INIT_OPTICAL: {
            return { ...state, lastStatus: 'INITIALIZED' }
        }
        case Act.GENERATE_OPTICAL_SCOPES: {
            return { ...state, lastStatus: 'OPTICAL_SCOPES_GENERATED' }
        }
        default:
            return state
    }
}

export { opticalReducer as reducer }
