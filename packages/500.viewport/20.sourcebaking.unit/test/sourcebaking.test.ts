import { describe, it, expect } from 'vitest'
import {
    projectCoordinatePercentages,
    inlineExposureAttributes,
    bakeStaticComposition,
} from '../buz/sourcebaking.buzz'
import type { BakeCompositionInput } from '../fce/sourcebaking.interface'

describe('20.sourcebaking.unit: Static React Source Emission Invariants', () => {
    const sampleInput: BakeCompositionInput = {
        episodeId: '040',
        seriesSlug: 'under-the-floorboards',
        shots: [
            {
                shotIndex: 1,
                fromFrame: 0,
                durationInFrames: 75,
                speakerId: 'spk_bog',
                characterName: 'BOG',
                emotion: 'humiliated',
                dialogueText: 'They locked the cellar doors.',
                audioWavPath: 'audio/dialogue/ep040_sh01.wav',
                anchorPoint: { x: 512, y: 980 },
                mouthBoundingBox: { x: 380, y: 240, width: 64, height: 32 },
            },
            {
                shotIndex: 2,
                fromFrame: 75,
                durationInFrames: 99,
                speakerId: 'spk_spleen',
                characterName: 'SPLEEN',
                emotion: 'defensive',
                dialogueText: 'We dig beneath the joists then.',
                audioWavPath: 'audio/dialogue/ep040_sh02.wav',
                anchorPoint: { x: 480, y: 960 },
                mouthBoundingBox: { x: 410, y: 220, width: 58, height: 30 },
                sidechainDuckingDb: -14,
            },
        ],
    }

    it('[TASK-VT-3.1] Dynamic Array Mapping Eradication: emits zero .map() or .forEach() loops in output', () => {
        const receipt = bakeStaticComposition(sampleInput)
        expect(receipt.status).toBe('SUCCESS')

        // The output code must contain zero runtime array iteration constructs
        expect(receipt.sourceCode.includes('.map(')).toBe(false)
        expect(receipt.sourceCode.includes('.forEach(')).toBe(false)
        expect(receipt.sourceCode.includes('sceneData.')).toBe(false)

        // Verify concrete unrolled instances
        expect(receipt.sourceCode).toContain('SHOT 01 STATIC SEQUENCE')
        expect(receipt.sourceCode).toContain('SHOT 02 STATIC SEQUENCE')
    })

    it('[TASK-VT-3.2] Unquoted Integer Numeric Bounds Inlining: emits raw numeric literals for frame and duration props', () => {
        const receipt = bakeStaticComposition(sampleInput)

        // Assert unquoted integer literals: from={0} and durationInFrames={75}
        expect(receipt.sourceCode).toContain('from={0}')
        expect(receipt.sourceCode).toContain('durationInFrames={75}')
        expect(receipt.sourceCode).toContain('from={75}')
        expect(receipt.sourceCode).toContain('durationInFrames={99}')

        // Reject illegal string-coerced numeric attributes
        expect(receipt.sourceCode).not.toContain('from="0"')
        expect(receipt.sourceCode).not.toContain('durationInFrames="75"')
        expect(receipt.sourceCode).not.toContain('from={"0"}')
        expect(receipt.sourceCode).not.toContain('durationInFrames={"75"}')
    })

    it('[TASK-VT-3.2] inlineExposureAttributes throws error when passed floating point frames', () => {
        expect(() => inlineExposureAttributes(0.5, 75)).toThrowError(
            /ERR_FLOAT_FRAME_BOUNDS/,
        )
        expect(() => inlineExposureAttributes(0, 74.88)).toThrowError(
            /ERR_FLOAT_FRAME_BOUNDS/,
        )
    })

    it('[TASK-VT-3.3] Coordinate Normalization Matrix Projection: calculates normalized transform-origin percentage literals', () => {
        // 512 / 1024 * 100 = 50.00%, 980 / 1024 * 100 = 95.70%
        const projection = projectCoordinatePercentages(512, 980)
        expect(projection.originXPercent).toBe('50.00%')
        expect(projection.originYPercent).toBe('95.70%')

        const receipt = bakeStaticComposition(sampleInput)
        expect(receipt.sourceCode).toContain("transformOrigin: '50.00% 95.70%'")
    })

    it('verifies strict 7-bit ASCII compliance across emitted source code', () => {
        const receipt = bakeStaticComposition(sampleInput)
        const nonAsciiRegex = /[^\x00-\x7F]/
        expect(nonAsciiRegex.test(receipt.sourceCode)).toBe(false)
    })
})
