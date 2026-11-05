import { describe, it, expect } from 'vitest'
import {
    quantizeShotDuration,
    sampleToFrame,
    frameToSample,
    accumulateTimeline,
    adaptCausalLattice,
    SAMPLES_PER_FRAME,
    FRAME_DURATION_MS,
} from '../buz/temporalquantization.buzz'

describe('22.temporalquantization.unit: Invariant & Mathematical Proofs', () => {
    it('[TASK-VT-2.1] quantizes continuous millisecond duration using ceiling arithmetic', () => {
        // 3120.50 ms at 24 fps -> ceil(74.892) = 75 frames
        const frames = quantizeShotDuration(3120.5)
        expect(frames).toBe(75)
        expect(Number.isInteger(frames)).toBe(true)
    })

    it('[TASK-VT-2.1] enforces Sub-Frame Zero-Length Clamp (< 41.67 ms clamped to 1 frame)', () => {
        const briefGrunt = quantizeShotDuration(30.0)
        expect(briefGrunt).toBe(1)

        const microInterjection = quantizeShotDuration(5.0)
        expect(microInterjection).toBe(1)
    })

    it('[TASK-VT-2.1] verifies 2000-sample constant domain bridge', () => {
        expect(SAMPLES_PER_FRAME).toBe(2000)

        // Plosive at sample 26,742 -> floor(26742 / 2000) = Frame 13
        const frameIndex = sampleToFrame(26742)
        expect(frameIndex).toBe(13)

        // Frame 13 start sample -> 13 * 2000 = 26000
        const startSample = frameToSample(13)
        expect(startSample).toBe(26000)
    })

    it('[TASK-VT-2.2] guarantees contiguous timeline tiling with zero gaps and zero overlaps', () => {
        const shots = [
            { shotId: 'sh01', durationMs: 3120 },
            { shotId: 'sh02', durationMs: 1840 },
            { shotId: 'sh03', durationMs: 2400 },
        ]

        const receipt = accumulateTimeline(shots)
        expect(receipt.status).toBe('SUCCESS')
        expect(receipt.shots.length).toBe(3)

        // Assert End_k + 1 === Start_{k+1}
        for (let k = 0; k < receipt.shots.length - 1; k++) {
            expect(receipt.shots[k].endFrame + 1).toBe(
                receipt.shots[k + 1].startFrame,
            )
        }

        // Assert total episode drift is bounded strictly under 1 frame (< 41.67 ms)
        expect(receipt.maxDriftMs).toBeLessThan(FRAME_DURATION_MS)
    })

    it('[TASK-VT-2.3] adapts target frames to 4n+1 causal diffusion lattice', () => {
        // Target 75 frames -> n = ceil((75 - 1) / 4) = 19 -> 4(19) + 1 = 77
        const result = adaptCausalLattice(75)
        expect(result.diffusionFrames).toBe(77)
        expect(result.trimEndFrames).toBe(2)
        expect((result.diffusionFrames - 1) % 4).toBe(0)

        // Target 50 frames -> n = ceil(49 / 4) = 13 -> 4(13) + 1 = 53
        const result50 = adaptCausalLattice(50)
        expect(result50.diffusionFrames).toBe(53)
        expect(result50.trimEndFrames).toBe(3)
        expect((result50.diffusionFrames - 1) % 4).toBe(0)

        // Exact boundary: 73 frames -> 4(18) + 1 = 73
        const result73 = adaptCausalLattice(73)
        expect(result73.diffusionFrames).toBe(73)
        expect(result73.trimEndFrames).toBe(0)
    })
})
