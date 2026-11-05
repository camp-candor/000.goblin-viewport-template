import { ViewportMenuModel, MenuChoiceItem } from './fce/menu.interface.js'
import {
    VIEWPORT_MENU_CHOICES,
    CANONICAL_LOCAL_LOOPBACK,
} from './buz/00.menu.buzz.js'

export const INITIAL_MENU_STATE: ViewportMenuModel = Object.freeze({
    idx: '98.menu.unit',
    activeIndex: 0,
    choices: Object.freeze([...VIEWPORT_MENU_CHOICES]),
    targetEndpoint: CANONICAL_LOCAL_LOOPBACK,
    isHeadless: typeof (globalThis as any).LIBRARY === 'undefined',
    lastDispatchedAtMs: 0,
    selectedChoice: 0,
    activeEpisodeId: 'ep01_sc03',
    lastActionStatus: 'IDLE',
})

export class MenuModel implements ViewportMenuModel {
    idx: string = '98.menu.unit'
    activeIndex: number = 0
    choices: readonly MenuChoiceItem[] = Object.freeze([
        ...VIEWPORT_MENU_CHOICES,
    ])
    targetEndpoint: string = CANONICAL_LOCAL_LOOPBACK
    isHeadless: boolean = typeof (globalThis as any).LIBRARY === 'undefined'
    lastDispatchedAtMs: number = 0
    selectedChoice: number = 0
    activeEpisodeId: string = 'ep01_sc03'
    lastActionStatus: string = 'IDLE'

    constructor(init?: Partial<ViewportMenuModel>) {
        if (init) {
            Object.assign(this, init)
        }
    }
}

export default MenuModel
