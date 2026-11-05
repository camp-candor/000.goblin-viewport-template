import { MenuBit } from './fce/menu.bit.js'

export const INIT_VIEWPORT_MENU = 'menu:init_viewport_menu'
export const UPDATE_VIEWPORT_MENU = 'menu:update_viewport_menu'
export const EXECUTE_MENU_CHOICE = 'menu:execute_menu_choice'
export const TOGGLE_MENU_ENDPOINT = 'menu:toggle_menu_endpoint'

export const INIT_MENU = 'menu:init'
export const UPDATE_MENU = 'menu:update_menu'

export class InitViewportMenu {
    readonly type = INIT_VIEWPORT_MENU
    constructor(public bale?: MenuBit) {}
}

export class UpdateViewportMenu {
    readonly type = UPDATE_VIEWPORT_MENU
    constructor(public bale?: MenuBit) {}
}

export class ExecuteMenuChoice {
    readonly type = EXECUTE_MENU_CHOICE
    constructor(public bale?: MenuBit) {}
}

export class ToggleMenuEndpoint {
    readonly type = TOGGLE_MENU_ENDPOINT
    constructor(public bale?: MenuBit) {}
}

export class LegacyInitMenu {
    readonly type = INIT_MENU
    constructor(public bale?: MenuBit) {}
}

export class LegacyUpdateMenu {
    readonly type = UPDATE_MENU
    constructor(public bale?: MenuBit) {}
}

export class InitMenu extends InitViewportMenu {}
export class UpdateMenu extends UpdateViewportMenu {}

export type MenuActions =
    | InitViewportMenu
    | UpdateViewportMenu
    | ExecuteMenuChoice
    | ToggleMenuEndpoint
    | LegacyInitMenu
    | LegacyUpdateMenu
    | InitMenu
    | UpdateMenu
