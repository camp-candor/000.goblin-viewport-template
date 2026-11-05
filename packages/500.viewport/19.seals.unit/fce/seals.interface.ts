export type LifecycleState = 'generated' | 'patched' | 'locked'

export interface HeaderDocblockMetadata {
    lifecycle: LifecycleState
    checksum: string
    seriesSlug: string
    episodeId: string
    sealedAt?: string
    patchHistory?: string[]
}

export interface ParsedSourceFile {
    hasHeader: boolean
    metadata?: HeaderDocblockMetadata
    bodyText: string
    fullContent: string
}

export interface SealEmissionInput {
    targetFilePath: string
    seriesSlug: string
    episodeId: string
    rawBodySource: string
    forceOverwrite?: boolean
}

export interface ClobberArbitrationResult {
    status: 'WRITTEN' | 'REFUSED_EMITTED_CANDIDATE'
    targetPath: string
    writtenPath: string
    lifecycle: LifecycleState
    checksum: string
    divergedFromStamped: boolean
    refusalReason?: string
}

export interface SealsReceipt {
    status: 'SUCCESS' | 'ERROR'
    episodeId: string
    arbitration: ClobberArbitrationResult
    errorMessage?: string
}

export default interface Seals {
    // Seals state bit contract; SealsModel implements structurally.
}
