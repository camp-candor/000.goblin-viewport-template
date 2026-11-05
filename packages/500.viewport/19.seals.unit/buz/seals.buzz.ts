import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { SealsBit } from '../fce/seals.bit'
import {
    LifecycleState,
    HeaderDocblockMetadata,
    ParsedSourceFile,
    SealEmissionInput,
    ClobberArbitrationResult,
} from '../fce/seals.interface'

/**
 * Normalizes string text to standard POSIX Line Feeds (\n),
 * stripping carriage returns (\r\n -> \n) and trailing whitespace.
 */
export const normalizeLf = (text: string): string => {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/**
 * [TASK-VT-8.1] Normalized Body Checksum Hash Calculator.
 * Calculates cryptographic SHA-256 digest over normalized body text.
 */
export const computeBodyChecksum = (bodyText: string): string => {
    const normalized = normalizeLf(bodyText).trim()
    return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex')
}

/**
 * [TASK-VT-8.2] Lifecycle Header Docblock Formatter.
 * Synthesizes header comment docblock stamped at byte offset zero.
 */
export const formatHeaderDocblock = (meta: HeaderDocblockMetadata): string => {
    const timestamp = meta.sealedAt || new Date().toISOString()
    const patches =
        meta.patchHistory && meta.patchHistory.length > 0
            ? `\n// @patch_history: ${JSON.stringify(meta.patchHistory)}`
            : ''

    return `// @lifecycle: ${meta.lifecycle}
// @checksum: ${meta.checksum}
// @series: ${meta.seriesSlug}
// @episode: ${meta.episodeId}
// @sealed_at: ${timestamp}${patches}
`
}

/**
 * Parses existing file to extract stamped metadata and isolated body text.
 */
export const parseExistingSourceFile = (content: string): ParsedSourceFile => {
    const normalized = normalizeLf(content)
    const headerRegex =
        /^\/\/\s*@lifecycle:\s*(generated|patched|locked)\n\/\/\s*@checksum:\s*([a-f0-9]{64})\n\/\/\s*@series:\s*([^\n]+)\n\/\/\s*@episode:\s*([^\n]+)(?:\n\/\/\s*@sealed_at:\s*([^\n]+))?(?:\n\/\/\s*@patch_history:\s*(\[[^\]]*\]))?\n+/

    const match = normalized.match(headerRegex)
    if (!match) {
        return {
            hasHeader: false,
            bodyText: normalized,
            fullContent: normalized,
        }
    }

    const [
        fullHeaderMatch,
        lifecycle,
        checksum,
        seriesSlug,
        episodeId,
        sealedAt,
        rawPatches,
    ] = match
    const bodyText = normalized.slice(fullHeaderMatch.length)

    return {
        hasHeader: true,
        metadata: {
            lifecycle: lifecycle as LifecycleState,
            checksum,
            seriesSlug,
            episodeId,
            sealedAt,
            patchHistory: rawPatches ? JSON.parse(rawPatches) : undefined,
        },
        bodyText,
        fullContent: normalized,
    }
}

/**
 * [TASK-VT-8.3] Clobber Refusal Guard & Directorial Override Protector.
 * Arbitrates file emission: if target file is locked or manually modified,
 * writes to .candidate.tsx rather than clobbering existing source.
 */
export const arbitrateAndEmitComposition = (
    input: SealEmissionInput,
): ClobberArbitrationResult => {
    const normalizedBody = normalizeLf(input.rawBodySource).trim()
    const newChecksum = computeBodyChecksum(normalizedBody)

    const targetDir = path.dirname(input.targetFilePath)
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }

    const fileExists = fs.existsSync(input.targetFilePath)

    if (fileExists && !input.forceOverwrite) {
        const existingContent = fs.readFileSync(input.targetFilePath, 'utf8')
        const parsed = parseExistingSourceFile(existingContent)

        if (parsed.hasHeader && parsed.metadata) {
            const isLocked = parsed.metadata.lifecycle === 'locked'
            const actualExistingBodyChecksum = computeBodyChecksum(
                parsed.bodyText,
            )
            const isDiverged =
                actualExistingBodyChecksum !== parsed.metadata.checksum

            // Directorial Override Protection Tripwire
            if (isLocked || isDiverged) {
                const candidatePath = input.targetFilePath.replace(
                    /\.tsx$/,
                    '.candidate.tsx',
                )
                const candidateHeader = formatHeaderDocblock({
                    lifecycle: 'generated',
                    checksum: newChecksum,
                    seriesSlug: input.seriesSlug,
                    episodeId: input.episodeId,
                })

                fs.writeFileSync(
                    candidatePath,
                    `${candidateHeader}\n${normalizedBody}\n`,
                    'utf8',
                )

                const reason = isLocked
                    ? 'ERR_CLOBBER_REFUSED: File is marked @lifecycle: locked.'
                    : 'ERR_CLOBBER_REFUSED: File checksum diverged from header. Manual edits detected.'

                return {
                    status: 'REFUSED_EMITTED_CANDIDATE',
                    targetPath: input.targetFilePath,
                    writtenPath: candidatePath,
                    lifecycle: parsed.metadata.lifecycle,
                    checksum: newChecksum,
                    divergedFromStamped: isDiverged,
                    refusalReason: reason,
                }
            }
        }
    }

    // Safe to write or overwrite cleanly
    const header = formatHeaderDocblock({
        lifecycle: 'generated',
        checksum: newChecksum,
        seriesSlug: input.seriesSlug,
        episodeId: input.episodeId,
    })

    const fullOutput = `${header}\n${normalizedBody}\n`
    fs.writeFileSync(input.targetFilePath, fullOutput, 'utf8')

    return {
        status: 'WRITTEN',
        targetPath: input.targetFilePath,
        writtenPath: input.targetFilePath,
        lifecycle: 'generated',
        checksum: newChecksum,
        divergedFromStamped: false,
    }
}

export const runEmitSealedCompositionBuzz = (
    ste: any,
    bale: SealsBit,
    bal: { slv: Function; blk: Function },
): void => {
    try {
        const input = bale.dat?.input
        if (!input) {
            throw new Error('ERR_MISSING_INPUT: bale.dat.input is required.')
        }

        const arbitration = arbitrateAndEmitComposition(input)

        if (arbitration.status === 'REFUSED_EMITTED_CANDIDATE') {
            bal.slv({
                idx: bale.idx,
                val: 1,
                src: `>> [REFUSAL] Directorial override detected. Emitted candidate draft: ${arbitration.writtenPath}`,
                dat: {
                    receipt: {
                        status: 'SUCCESS',
                        episodeId: input.episodeId,
                        arbitration,
                    },
                },
            })
            return
        }

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: `>> [OK] [SEAL] Stamped and sealed Episode ${input.episodeId} (checksum: ${arbitration.checksum.substring(0, 12)}...).`,
            dat: {
                receipt: {
                    status: 'SUCCESS',
                    episodeId: input.episodeId,
                    arbitration,
                },
            },
        })
    } catch (err: any) {
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: `>> [FAIL] [SEAL] Invariant violation: ${err.message}`,
            dat: { error: err.message },
        })
    }
}
