export interface OpticalLayerSpec {
    environmentMattePath: string
    vectorSubtitleText?: string
    characterName: string
    emotion: string
    greenDespillEnabled: boolean
    contactShadowEnabled: boolean
    lensSimulationEnabled: boolean
}

export interface ShotScopingPlan {
    shotIndex: number
    fromFrame: number
    durationInFrames: number
    transformOrigin: string
    zoomScale: number
    opticalLayers: OpticalLayerSpec
}

export interface OpticalPressOutput {
    cameraWrapperCode: string
    opticalStackJsx: string
}

export interface OpticalScopingReceipt {
    status: 'SUCCESS' | 'ERROR'
    episodeId: string
    shotCount: number
    synthesizedWrappers: string[]
    errorMessage?: string
}
