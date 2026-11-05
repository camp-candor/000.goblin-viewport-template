import { ViewportMenuModel } from './fce/menu.interface'

export class MenuModel implements ViewportMenuModel {
    idx: string = '98.menu.unit'
    selectedChoice: number = 0
    activeEpisodeId: string = 'ep040'
    lastActionStatus: string = 'IDLE'
}

export default MenuModel
