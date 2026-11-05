export interface MenuChoiceItem {
    choice: number
    label: string
    actionType: string
    description: string
    journey?: (ste: any) => Promise<void> | void
}

export interface GridCoordinates {
    x: number
    y: number
    xSpan: number
    ySpan: number
}

export interface ViewportMenuModel {
    idx: string
    activeIndex: number
    choices: readonly MenuChoiceItem[]
    targetEndpoint: string
    isHeadless: boolean
    lastDispatchedAtMs: number
    selectedChoice?: number
    activeEpisodeId?: string
    lastActionStatus?: string
}

export type Menu = ViewportMenuModel
export default ViewportMenuModel
