import { MenuBit } from './fce/menu.bit'

export const INIT_MENU = 'menu:init'
export const UPDATE_MENU = 'menu:update_menu'
export const EXECUTE_MENU_CHOICE = 'menu:execute_menu_choice'

export class InitMenu {
    readonly type = INIT_MENU
    constructor(public bale: MenuBit) {}
}

export class UpdateMenu {
    readonly type = UPDATE_MENU
    constructor(public bale: MenuBit) {}
}

export class ExecuteMenuChoice {
    readonly type = EXECUTE_MENU_CHOICE
    constructor(public bale: MenuBit) {}
}

export type MenuActions = InitMenu | UpdateMenu | ExecuteMenuChoice
