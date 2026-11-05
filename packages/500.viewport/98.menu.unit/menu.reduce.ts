import * as Act from './menu.action'
import { MenuModel } from './menu.model'
import * as Buzz from './menu.buzzer'
import type State from '../99.core/state'

export function menuReducer(
    state: MenuModel = new MenuModel(),
    action: Act.MenuActions,
): MenuModel {
    switch (action.type) {
        case Act.INIT_MENU: {
            return { ...state, lastActionStatus: 'INITIALIZED' }
        }
        case Act.UPDATE_MENU: {
            return { ...state, lastActionStatus: 'UPDATED' }
        }
        case Act.EXECUTE_MENU_CHOICE: {
            return { ...state, lastActionStatus: 'EXECUTED' }
        }
        default:
            return state
    }
}

/**
 * BEE-facing reducer entry: pure state transition plus cockpit buzz
 * orchestration. Restores the dispatch->buzz wiring so hunting INIT_MENU
 * or UPDATE_MENU mounts the Blessed switchboard (the pure menuReducer
 * alone renders nothing on screen).
 */
export function reducer(
    model: MenuModel = new MenuModel(),
    act: Act.MenuActions,
    state?: State,
): MenuModel {
    const next = menuReducer(model, act)
    const bale: any = (act as any).bale || {}
    const bal = {
        slv: typeof bale.slv === 'function' ? bale.slv : () => {},
        blk: typeof bale.blk === 'function' ? bale.blk : () => {},
    }
    if (act.type === Act.INIT_MENU) {
        Buzz.runInitMenuBuzz(state, bale, bal)
    } else if (act.type === Act.UPDATE_MENU) {
        Buzz.runUpdateMenuBuzz(state, bale, bal)
    }
    return next
}

export default menuReducer
