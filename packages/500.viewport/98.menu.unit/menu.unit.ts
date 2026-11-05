import { MenuModel } from './menu.model.js'
import { menuReducer } from './menu.reduce.js'
import * as Act from './menu.action.js'
import * as Buzz from './menu.buzzer.js'

export class MenuUnit {
    public model: MenuModel = new MenuModel()

    constructor(state?: any) {}

    public reduce(state: MenuModel, action: Act.MenuActions): any {
        return menuReducer(state, action)
    }

    public initMenu(ste: any, bale: any, bal: any): void {
        Buzz.runInitMenuBuzz(ste, bale, bal)
    }

    public updateMenu(ste: any, bale: any, bal: any): void {
        Buzz.runUpdateMenuBuzz(ste, bale, bal)
    }
}

export default MenuUnit
