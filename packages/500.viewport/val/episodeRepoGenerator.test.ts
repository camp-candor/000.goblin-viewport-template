import { describe, it, expect, vi } from 'vitest'
import { generateEpisodeRepository } from '../../../generator/generate-episode-repo'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

describe('generateEpisodeRepository', () => {
    it('should generate the episode repository correctly', () => {
        const outDir = './test-out-repo'

        // Clean up before test
        if (fs.existsSync(outDir)) {
            fs.rmSync(outDir, { recursive: true, force: true })
        }

        generateEpisodeRepository({
            outDir,
            episodeId: '001',
            seriesSlug: 'wiregrass-basin',
            audioOnly: true,
        })

        // Check 1 & 4
        expect(
            fs.existsSync(
                path.join(outDir, 'src/compositions/Episode_001.tsx'),
            ),
        ).toBe(true)
        expect(fs.existsSync(path.join(outDir, 'remotion.config.ts'))).toBe(
            true,
        )
        expect(fs.existsSync(path.join(outDir, 'package.json'))).toBe(true)
        expect(
            fs.existsSync(path.join(outDir, 'out/render_manifest.json')),
        ).toBe(true)

        // Check 2 (inside the file)
        const content = fs.readFileSync(
            path.join(outDir, 'src/compositions/Episode_001.tsx'),
            'utf8',
        )
        expect(content).toContain('// @lifecycle: generated')
        expect(content).toContain('// @checksum:')
        expect(content).not.toContain('GoblinPuppet')
        expect(content).not.toContain('../')

        // Check clobber refusal
        const lockedContent = content.replace(
            '// @lifecycle: generated',
            '// @lifecycle: locked',
        )
        fs.writeFileSync(
            path.join(outDir, 'src/compositions/Episode_001.tsx'),
            lockedContent,
            'utf8',
        )

        generateEpisodeRepository({
            outDir,
            episodeId: '001',
            seriesSlug: 'wiregrass-basin',
            audioOnly: true,
        })

        expect(
            fs.existsSync(
                path.join(outDir, 'src/compositions/Episode_001.candidate.tsx'),
            ),
        ).toBe(true)
        const lockedContentAfter = fs.readFileSync(
            path.join(outDir, 'src/compositions/Episode_001.tsx'),
            'utf8',
        )
        expect(lockedContentAfter).toContain('// @lifecycle: locked') // Unchanged

        // Clean up
        if (fs.existsSync(outDir)) {
            fs.rmSync(outDir, { recursive: true, force: true })
        }
    })
})
