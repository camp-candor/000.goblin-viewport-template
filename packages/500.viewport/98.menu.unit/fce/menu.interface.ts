export interface MenuChoiceItem {
    choice: number
    label: string
    actionType: string
    description: string
    journey?: (ste: any) => Promise<void> | void
}

export interface ViewportMenuModel {
    idx: string
    selectedChoice: number
    activeEpisodeId: string
    lastActionStatus: string
}

export interface GridCoordinates {
    x: number
    y: number
    xSpan: number
    ySpan: number
}

export type Menu = ViewportMenuModel
export default ViewportMenuModel
