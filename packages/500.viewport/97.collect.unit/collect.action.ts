import { CollectBit } from './fce/collect.bit'

export const INIT_COLLECT = 'collect:init'
export const HARVEST_EPISODE_ASSETS = 'collect:harvest_episode_assets'

export class InitCollect {
    readonly type = INIT_COLLECT
    constructor(public bale: CollectBit) {}
}

export class HarvestEpisodeAssets {
    readonly type = HARVEST_EPISODE_ASSETS
    constructor(public bale: CollectBit) {}
}

export type CollectActions = InitCollect | HarvestEpisodeAssets
