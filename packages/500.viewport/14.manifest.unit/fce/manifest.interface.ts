export interface RepositoryCommitMap {
    'worker-sower-engine': string
    '001.goblin-lore': string
    'goblin-assets-visual': string
    'goblin-viewport-template': string
    [repoName: string]: string
}

export interface ToolchainEnvironment {
    nodeVersion: string
    remotionVersion: string
    chromiumBuild: string
    ffmpegVersion: string
    platform: string
    arch: string
}

export interface RenderManifestPayload {
    manifestVersion: string
    episodeId: string
    seriesSlug: string
    sealedAt: string
    canonMerkleRoot?: string
    repositories: RepositoryCommitMap
    toolchain: ToolchainEnvironment
    assetChecksums: Record<string, string>
    compositionChecksum: string
    lockfileSha256?: string
}

export interface MintManifestInput {
    episodeId: string
    seriesSlug: string
    targetEpisodeDir: string
    repositories: RepositoryCommitMap
    assetChecksums: Record<string, string>
    compositionChecksum: string
    canonMerkleRoot?: string
    toolchainOverrides?: Partial<ToolchainEnvironment>
}

export interface ManifestReceipt {
    status: 'SUCCESS' | 'ERROR'
    episodeId: string
    lockfilePath: string
    lockfileSha256: string
    isReadOnly: boolean
    errorMessage?: string
}

export default interface Manifest {}
