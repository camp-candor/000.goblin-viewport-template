import { ViewportMenuModel, MenuChoiceItem } from './menu.interface'

export interface MenuBit {
    idx: string
    src?: string
    val: number
    dat?: {
        model?: ViewportMenuModel
        selectedChoice?: MenuChoiceItem
        error?: string
    }
}

export default MenuBit
