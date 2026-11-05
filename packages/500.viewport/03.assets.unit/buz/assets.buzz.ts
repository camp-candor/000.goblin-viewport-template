import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { AssetsBit } from '../fce/assets.bit'
import { AssetFileAudit, StorageEnvelopeReceipt } from '../fce/assets.interface'

export const ZERO_BYTE_SHA256 =
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
export const NOMINAL_BUDGET_BYTES = 100 * 1024 * 1024 // 100 MB
export const HARD_CEILING_BYTES = 150 * 1024 * 1024 // 150 MB

export const collectAllFiles = (dir: string): string[] => {
    let results: string[] = []
    if (!fs.existsSync(dir)) return results
    const list = fs.readdirSync(dir)
    for (const file of list) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            results = results.concat(collectAllFiles(fullPath))
        } else {
            results.push(fullPath)
        }
    }
    return results
}

/**
 * [TASK-VT-5.2] & [TASK-VT-5.3] Audits the local staging directory for poison files and storage ceilings.
 */
export const auditStorageEnvelope = (
    targetDir: string,
): StorageEnvelopeReceipt => {
    const files = collectAllFiles(targetDir)
    const audits: AssetFileAudit[] = []
    let totalBytes = 0

    for (const filePath of files) {
        const stat = fs.statSync(filePath)
        const sizeBytes = stat.size
        totalBytes += sizeBytes

        const fileBuffer = fs.readFileSync(filePath)
        const hash = crypto
            .createHash('sha256')
            .update(fileBuffer)
            .digest('hex')

        const isZeroByte = sizeBytes === 0 || hash === ZERO_BYTE_SHA256
        if (isZeroByte) {
            throw new Error(
                `ERR_ZERO_BYTE_POISON: Empty zero-byte poison asset detected: ${filePath}`,
            )
        }

        const firstLine = fileBuffer.subarray(0, 40).toString('utf8')
        const isUnhydratedLfs = firstLine.startsWith('version https://git-lfs')
        if (isUnhydratedLfs) {
            throw new Error(
                `ERR_UNHYDRATED_LFS_POINTER: Unhydrated Git LFS text pointer detected: ${filePath}`,
            )
        }

        audits.push({
            filePath,
            sizeBytes,
            sha256: hash,
            isZeroByte: false,
            isUnhydratedLfs: false,
        })
    }

    const hardCeilingBreached = totalBytes > HARD_CEILING_BYTES
    if (hardCeilingBreached) {
        throw new Error(
            `ERR_STORAGE_CEILING_BREACH: Staged assets exceed hard 150MB limit (${(totalBytes / (1024 * 1024)).toFixed(2)} MB).`,
        )
    }

    return {
        status: 'SUCCESS',
        totalBytes,
        totalMegaBytes: Number((totalBytes / (1024 * 1024)).toFixed(2)),
        fileCount: audits.length,
        nominalBudgetPassed: totalBytes <= NOMINAL_BUDGET_BYTES,
        hardCeilingBreached: false,
        audits,
    }
}

export const runAuditStorageEnvelopeBuzz = (
    ste: any,
    bale: AssetsBit,
    bal: { slv: Function; blk: Function },
): void => {
    try {
        const targetDir = bale.dat?.targetDir
        if (!targetDir) {
            throw new Error(
                'ERR_MISSING_TARGET_DIR: bale.dat.targetDir is required.',
            )
        }

        const receipt = auditStorageEnvelope(targetDir)

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: `>> [OK] [ENVELOPE] Asset staging audited (${receipt.fileCount} files, ${receipt.totalMegaBytes} MB).`,
            dat: { receipt },
        })
    } catch (err: any) {
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: `>> [FAIL] [ENVELOPE] Invariant violation: ${err.message}`,
            dat: { error: err.message },
        })
    }
}
