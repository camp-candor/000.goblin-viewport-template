import { ViewportMenuModel, MenuChoiceItem } from './menu.interface.js'

export interface MenuBit {
    idx: string
    src?: string
    val: number
    dat?: {
        model?: ViewportMenuModel
        selectedChoice?: MenuChoiceItem
        targetEndpoint?: string
        activeIndex?: number
        error?: string
    }
    slv?: Function
    blk?: Function
}

export default MenuBit
