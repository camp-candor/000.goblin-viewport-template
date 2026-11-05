import * as Act from './menu.action.js'
import { MenuModel, INITIAL_MENU_STATE } from './menu.model.js'
import * as Buzz from './menu.buzzer.js'
import {
    setRuntimeEndpoint,
    CANONICAL_LOCAL_LOOPBACK,
} from '../08.edgecontrol.unit/buz/cascade.buzz.js'
import type State from '../99.core/state.js'
import type { ViewportMenuModel } from './fce/menu.interface.js'

export { INITIAL_MENU_STATE }

export function menuReducer(
    state: ViewportMenuModel = INITIAL_MENU_STATE,
    action: Act.MenuActions,
): ViewportMenuModel {
    if (!action || !action.type) {
        return Object.freeze({ ...state })
    }

    switch (action.type) {
        case Act.INIT_VIEWPORT_MENU:
        case 'menu:init': {
            return Object.freeze({
                ...state,
                lastActionStatus: 'INITIALIZED',
            })
        }
        case Act.UPDATE_VIEWPORT_MENU:
        case 'menu:update_menu': {
            const nextIdx =
                (action as any).bale?.val ??
                (action as any).bale?.dat?.activeIndex ??
                state.activeIndex
            return Object.freeze({
                ...state,
                activeIndex: nextIdx,
                selectedChoice: nextIdx,
                lastActionStatus: 'UPDATED',
            })
        }
        case Act.EXECUTE_MENU_CHOICE: {
            const nextIdx =
                (action as any).bale?.val ??
                (action as any).bale?.dat?.activeIndex ??
                state.activeIndex
            return Object.freeze({
                ...state,
                activeIndex: nextIdx,
                selectedChoice: nextIdx,
                lastDispatchedAtMs: Date.now(),
                lastActionStatus: 'EXECUTED',
            })
        }
        case Act.TOGGLE_MENU_ENDPOINT: {
            const LIVE_URL = 'https://viewport-edge.workers.dev'
            const LOCAL_URL = CANONICAL_LOCAL_LOOPBACK
            const current =
                (globalThis as any).agentBaseUrl ||
                state.targetEndpoint ||
                LOCAL_URL
            const nextUrl =
                current.includes('127.0.0.1') || current.includes('localhost')
                    ? LIVE_URL
                    : LOCAL_URL
            setRuntimeEndpoint(nextUrl)
            return Object.freeze({
                ...state,
                targetEndpoint: nextUrl,
                lastDispatchedAtMs: Date.now(),
                lastActionStatus: 'ENDPOINT_TOGGLED',
            })
        }
        default:
            return Object.freeze({ ...state })
    }
}

export function reducer(
    model: ViewportMenuModel = INITIAL_MENU_STATE,
    act: Act.MenuActions,
    state?: State,
): ViewportMenuModel {
    const next = menuReducer(model, act)
    const bale: any = (act as any)?.bale || {}
    const bal = {
        slv: typeof bale?.slv === 'function' ? bale.slv : () => {},
        blk: typeof bale?.blk === 'function' ? bale.blk : () => {},
    }
    const actionType = (act as any)?.type
    if (actionType === Act.INIT_VIEWPORT_MENU || actionType === Act.INIT_MENU) {
        Buzz.runInitMenuBuzz(state, bale, bal)
    } else if (
        actionType === Act.UPDATE_VIEWPORT_MENU ||
        actionType === Act.UPDATE_MENU
    ) {
        Buzz.runUpdateMenuBuzz(state, bale, bal)
    }
    return next
}

export default menuReducer
