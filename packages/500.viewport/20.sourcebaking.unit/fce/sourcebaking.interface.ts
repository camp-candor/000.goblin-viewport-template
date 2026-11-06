import { FoleyPlacementSpec } from '../../10.foley.unit/buz/foley.buzz.js';

export interface CharacterAnchor {
    x: number
    y: number
}

export interface BoundingBox {
    x: number
    y: number
    width: number
    height: number
}

export interface BakeShotPlan {
    shotIndex: number
    fromFrame: number
    durationInFrames: number
    speakerId: string
    characterName: string
    emotion: string
    dialogueText: string
    audioWavPath: string
    anchorPoint?: CharacterAnchor
    mouthBoundingBox?: BoundingBox
    sidechainDuckingDb?: number
}

export interface BakeCompositionInput {
    episodeId: string
    seriesSlug: string
    shots: BakeShotPlan[]
    canvasWidth?: number
    canvasHeight?: number
    audioOnly?: boolean
    foleyPlacements?: FoleyPlacementSpec[]
    ambientWavPath?: string
}

export interface CoordinateProjection {
    originXPercent: string
    originYPercent: string
}

export interface BakeReceipt {
    status: 'SUCCESS' | 'ERROR'
    episodeId: string
    totalDurationFrames: number
    shotCount: number
    sourceCode: string
    errorMessage?: string
}

export default interface Sourcebaking {
    // idx:string;
    // Source-baking state bit contract; SourceBakingModel implements structurally.
}
