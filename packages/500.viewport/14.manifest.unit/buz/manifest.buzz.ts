import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { ManifestBit } from '../fce/manifest.bit'
import {
    RepositoryCommitMap,
    ToolchainEnvironment,
    RenderManifestPayload,
    MintManifestInput,
    ManifestReceipt,
} from '../fce/manifest.interface'

export const REQUIRED_REPOSITORIES = [
    'worker-sower-engine',
    '001.goblin-lore',
    'goblin-assets-visual',
    'goblin-viewport-template',
]

export const SHA40_REGEX = /^[a-f0-9]{40}$/
export const SHA64_REGEX = /^[a-f0-9]{64}$/

/**
 * [TASK-VT-9.1] Validates the 40-character hexadecimal format for all participating repositories.
 */
export const validateRepositoryCommitMap = (
    repos: RepositoryCommitMap,
): void => {
    for (const required of REQUIRED_REPOSITORIES) {
        if (!repos[required]) {
            throw new Error(
                `ERR_MISSING_REPO_COMMIT: Manifest missing required repository hash [${required}].`,
            )
        }
    }

    for (const [repoName, commitSha] of Object.entries(repos)) {
        if (!SHA40_REGEX.test(commitSha)) {
            throw new Error(
                `ERR_INVALID_COMMIT_SHA: Repository [${repoName}] commit hash [${commitSha}] is not a valid 40-character lowercase hexadecimal SHA-1 string.`,
            )
        }
    }
}

/**
 * [TASK-VT-9.2] Captures host runtime toolchain environment metrics.
 */
export const captureToolchainEnvironment = (
    overrides?: Partial<ToolchainEnvironment>,
): ToolchainEnvironment => {
    return {
        nodeVersion: overrides?.nodeVersion || process.version,
        remotionVersion: overrides?.remotionVersion || '4.0.220',
        chromiumBuild: overrides?.chromiumBuild || '128.0.6613.119',
        ffmpegVersion: overrides?.ffmpegVersion || '6.1.1-essentials',
        platform: overrides?.platform || process.platform,
        arch: overrides?.arch || process.arch,
    }
}

/**
 * Sorts object keys deterministically according to RFC 8785 JSON Canonicalization rules.
 */
export const canonicalizeJson = (obj: any): string => {
    if (obj === null || typeof obj !== 'object') {
        return JSON.stringify(obj)
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map((item) => canonicalizeJson(item)).join(',') + ']'
    }
    const sortedKeys = Object.keys(obj).sort()
    const pairs = sortedKeys.map(
        (k) => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`,
    )
    return '{' + pairs.join(',') + '}'
}

/**
 * [TASK-VT-9.3] Assembles, serializes, and locks render_manifest.json with read-only permissions.
 */
export const mintProvenanceLockfile = (
    input: MintManifestInput,
): ManifestReceipt => {
    validateRepositoryCommitMap(input.repositories)

    if (
        !input.compositionChecksum ||
        !SHA64_REGEX.test(input.compositionChecksum)
    ) {
        throw new Error(
            `ERR_INVALID_COMPOSITION_CHECKSUM: Composition checksum must be a 64-character SHA-256 hash.`,
        )
    }

    if (input.canonMerkleRoot && !SHA64_REGEX.test(input.canonMerkleRoot)) {
        throw new Error(
            `ERR_INVALID_CANON_MERKLE_ROOT: Canon Merkle root must be a 64-character SHA-256 hash.`,
        )
    }

    const toolchain = captureToolchainEnvironment(input.toolchainOverrides)
    const targetDir = input.targetEpisodeDir

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    const payload: RenderManifestPayload = {
        manifestVersion: '1.0.0',
        episodeId: input.episodeId,
        seriesSlug: input.seriesSlug,
        sealedAt: new Date().toISOString(),
        canonMerkleRoot: input.canonMerkleRoot,
        repositories: input.repositories,
        toolchain,
        assetChecksums: input.assetChecksums,
        compositionChecksum: input.compositionChecksum,
    }

    const canonicalBody = canonicalizeJson(payload)
    const lockfileSha256 = crypto
        .createHash('sha256')
        .update(canonicalBody, 'utf8')
        .digest('hex')
    payload.lockfileSha256 = lockfileSha256

    const lockfilePath = path.join(targetDir, 'render_manifest.json')
    const tempPath = path.join(
        targetDir,
        `.tmp_render_manifest_${Date.now()}.json`,
    )

    const prettyJson = JSON.stringify(payload, null, 2) + '\n'

    // Atomic write and permission freezing (read-only 0o444)
    fs.writeFileSync(tempPath, prettyJson, { encoding: 'utf8', mode: 0o444 })
    fs.renameSync(tempPath, lockfilePath)
    fs.chmodSync(lockfilePath, 0o444)

    return {
        status: 'SUCCESS',
        episodeId: input.episodeId,
        lockfilePath,
        lockfileSha256,
        isReadOnly: true,
    }
}

export const runMintProvenanceLockfileBuzz = (
    ste: any,
    bale: ManifestBit,
    bal: { slv: Function; blk: Function },
): void => {
    try {
        const input = bale.dat?.input
        if (!input) {
            throw new Error('ERR_MISSING_INPUT: bale.dat.input is required.')
        }

        const receipt = mintProvenanceLockfile(input)

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: `>> [OK] [PROVENANCE] Sealed render_manifest.json (SHA-256: ${receipt.lockfileSha256.substring(0, 12)}...).`,
            dat: { receipt },
        })
    } catch (err: any) {
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: `>> [FAIL] [PROVENANCE] Invariant violation: ${err.message}`,
            dat: { error: err.message },
        })
    }
}
