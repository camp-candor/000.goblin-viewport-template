import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import {
    normalizeLf,
    computeBodyChecksum,
    formatHeaderDocblock,
    parseExistingSourceFile,
    arbitrateAndEmitComposition,
} from '../buz/seals.buzz'

describe('19.seals.unit: Cryptographic Sealing & Collision Arbitration', () => {
    const tmpDir = path.resolve(__dirname, '.tmp_seals_test')
    const targetFile = path.join(tmpDir, 'Episode_040.tsx')
    const candidateFile = path.join(tmpDir, 'Episode_040.candidate.tsx')

    const baseSource = `export const Episode_040: React.FC = () => {
  return <div style={{ width: 1920, height: 1080 }} />;
};`

    beforeEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
        fs.mkdirSync(tmpDir, { recursive: true })
    })

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    })

    it('[TASK-VT-8.1] normalizes line-endings and generates bit-identical SHA-256 body checksums', () => {
        const windowsText = 'const x = 1;\r\nconst y = 2;\r\n'
        const posixText = 'const x = 1;\nconst y = 2;\n'

        const hash1 = computeBodyChecksum(windowsText)
        const hash2 = computeBodyChecksum(posixText)

        expect(hash1).toBe(hash2)
        expect(hash1).toMatch(/^[a-f0-9]{64}$/)

        // Single character mutation must alter the hash completely
        const mutated = 'const x = 1;\nconst y = 3;\n'
        const hashMutated = computeBodyChecksum(mutated)
        expect(hashMutated).not.toBe(hash1)
    })

    it('[TASK-VT-8.2] formats lifecycle header docblock and parses metadata accurately', () => {
        const checksum = computeBodyChecksum(baseSource)
        const header = formatHeaderDocblock({
            lifecycle: 'generated',
            checksum,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            sealedAt: '2026-11-04T14:30:00.000Z',
        })

        expect(header.startsWith('// @lifecycle: generated')).toBe(true)
        expect(header).toContain(`// @checksum: ${checksum}`)
        expect(header).toContain('// @series: under-the-floorboards')
        expect(header).toContain('// @episode: 040')

        const parsed = parseExistingSourceFile(`${header}\n${baseSource}`)
        expect(parsed.hasHeader).toBe(true)
        expect(parsed.metadata?.lifecycle).toBe('generated')
        expect(parsed.metadata?.checksum).toBe(checksum)
        expect(parsed.bodyText.trim()).toBe(baseSource.trim())
    })

    it('[TASK-VT-8.3] writes clean file when target does not yet exist', () => {
        const result = arbitrateAndEmitComposition({
            targetFilePath: targetFile,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            rawBodySource: baseSource,
        })

        expect(result.status).toBe('WRITTEN')
        expect(result.writtenPath).toBe(targetFile)
        expect(fs.existsSync(targetFile)).toBe(true)

        const content = fs.readFileSync(targetFile, 'utf8')
        expect(content).toContain('// @lifecycle: generated')
        expect(content).toContain(baseSource)
    })

    it('[TASK-VT-8.3] clobber refusal guard refuses overwrite when file is @lifecycle: locked', () => {
        // 1. Initial write with locked state
        const checksum = computeBodyChecksum(baseSource)
        const lockedHeader = formatHeaderDocblock({
            lifecycle: 'locked',
            checksum,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
        })
        fs.writeFileSync(targetFile, `${lockedHeader}\n${baseSource}\n`, 'utf8')

        // 2. Upstream compilation tries to regenerate
        const newBodySource = `${baseSource}\n// upstream automated tweak`
        const result = arbitrateAndEmitComposition({
            targetFilePath: targetFile,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            rawBodySource: newBodySource,
        })

        expect(result.status).toBe('REFUSED_EMITTED_CANDIDATE')
        expect(result.writtenPath).toBe(candidateFile)
        expect(fs.existsSync(candidateFile)).toBe(true)

        // Assert original target file was left completely untouched
        const untouched = fs.readFileSync(targetFile, 'utf8')
        expect(untouched).toContain('// @lifecycle: locked')
        expect(untouched).not.toContain('// upstream automated tweak')
    })

    it('[TASK-VT-8.3] clobber refusal guard triggers when body diverges from stamped checksum (manual edit detection)', () => {
        // 1. Initial write
        arbitrateAndEmitComposition({
            targetFilePath: targetFile,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            rawBodySource: baseSource,
        })

        // 2. Director hits "Eject Button" and makes a manual manual edit without updating the header checksum
        const manuallyEdited = fs
            .readFileSync(targetFile, 'utf8')
            .replace('width: 1920', 'width: 1920, transform: "scale(1.05)"')
        fs.writeFileSync(targetFile, manuallyEdited, 'utf8')

        // 3. Automated re-compile occurs
        const recompileResult = arbitrateAndEmitComposition({
            targetFilePath: targetFile,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            rawBodySource: baseSource,
        })

        expect(recompileResult.status).toBe('REFUSED_EMITTED_CANDIDATE')
        expect(recompileResult.divergedFromStamped).toBe(true)
        expect(fs.existsSync(candidateFile)).toBe(true)

        // Existing manual edits preserved
        const preserved = fs.readFileSync(targetFile, 'utf8')
        expect(preserved).toContain('transform: "scale(1.05)"')
    })

    it('guarantees pure 7-bit ASCII constraints across docblocks and outputs', () => {
        const nonAsciiRegex = /[^\x00-\x7F]/
        const header = formatHeaderDocblock({
            lifecycle: 'generated',
            checksum:
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
        })

        expect(nonAsciiRegex.test(header)).toBe(false)
    })
})
