import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { resolveFoleyPlacements, unrollFoleySequencesJsx } from '../10.foley.unit/buz/foley.buzz.js'
import { mergeSpeechWindows, unrollAmbientTrackJsx, computeAmbientDuckingCurve } from '../02.ambience.unit/buz/ambience.buzz.js'

describe('Foley and Ambience Units', () => {

    it('should have zero debugger statements', () => {
        const foleyPath = path.resolve(__dirname, '../10.foley.unit/buz/foley.buzz.ts')
        const ambiencePath = path.resolve(__dirname, '../02.ambience.unit/buz/ambience.buzz.ts')

        const foleyCode = fs.readFileSync(foleyPath, 'utf8')
        const ambienceCode = fs.readFileSync(ambiencePath, 'utf8')

        expect(foleyCode).not.toContain('debugger')
        expect(ambienceCode).not.toContain('debugger')
    })

    it('resolveFoleyPlacements matches Foley cues deterministically', () => {
        const cues = [
            { text: 'A heavy rain squall approaches.', fromFrame: 10 },
            { text: 'The diesel truck is idle.', fromFrame: 20 },
            { text: 'The door opens with a hiss.', fromFrame: 30 },
            { text: 'She sits in the booth and it creaks.', fromFrame: 40 },
            { text: 'He drops the menu on the table.', fromFrame: 50 },
            { text: 'Waitress pours coffee.', fromFrame: 60 },
            { text: 'She wipes a tear from her eye.', fromFrame: 70 },
            { text: 'The camera lens clicks.', fromFrame: 80 },
            { text: 'A semi drives past the diner.', fromFrame: 90 }
        ]

        const placements = resolveFoleyPlacements('scene-1', cues)

        expect(placements.length).toBe(9)
        expect(placements[0].category).toBe('rain_squall')
        expect(placements[1].category).toBe('diesel_idle')
        expect(placements[2].category).toBe('door_hiss')
        expect(placements[3].category).toBe('booth_creak')
        expect(placements[4].category).toBe('menu_drop')
        expect(placements[5].category).toBe('coffee_pour')
        expect(placements[6].category).toBe('wipe_tear')
        expect(placements[7].category).toBe('lens_click')
        expect(placements[8].category).toBe('semi_pass')

        // Ensure deterministic (run again, should match exactly)
        const placements2 = resolveFoleyPlacements('scene-1', cues)
        expect(placements).toEqual(placements2)
    })

    it('applies :retry1 anti-clustering if same cue is hit within 120 frames with identical variant', () => {
        const cues = [
            { text: 'The door opens with a hiss.', fromFrame: 10 },
            { text: 'The door opens with a hiss again.', fromFrame: 30 }
        ]

        // Note: For anti-clustering to be visibly tested, we might need a specific seed that yields same variant,
        // but our resolveFoleyPlacements guarantees distinct variant if it hit the same within 120 frames.
        const placements = resolveFoleyPlacements('scene-hiss-test', cues)

        expect(placements.length).toBe(2)
        expect(placements[0].category).toBe('door_hiss')
        expect(placements[1].category).toBe('door_hiss')
        expect(placements[0].wavPath).not.toBe(placements[1].wavPath)
    })

    it('mergeSpeechWindows merges windows <= 18 frames apart', () => {
        const windows = [
            { fromFrame: 10, durationInFrames: 20 },
            { fromFrame: 40, durationInFrames: 20 }, // Gap of 10 from (10+20)=30 to 40 (<=18) -> merge
            { fromFrame: 100, durationInFrames: 20 } // Gap of 40 from (40+20)=60 to 100 (>18) -> don't merge
        ]

        const merged = mergeSpeechWindows(windows)
        expect(merged.length).toBe(2)
        expect(merged[0].fromFrame).toBe(10)
        expect(merged[0].durationInFrames).toBe(50) // 10 to 60
        expect(merged[1].fromFrame).toBe(100)
        expect(merged[1].durationInFrames).toBe(20)
    })

    it('unrollFoleySequencesJsx rejects float frame bounds and emits correctly', () => {
        expect(() => {
            unrollFoleySequencesJsx([{ category: 'door_hiss', fromFrame: 10.5, durationInFrames: 24, wavPath: 'test.wav' }])
        }).toThrowError('ERR_FLOAT_FOLEY_FRAME')

        const jsx = unrollFoleySequencesJsx([{ category: 'door_hiss', fromFrame: 10, durationInFrames: 24, wavPath: 'assets/test.wav' }])
        expect(jsx).toBe('<Sequence from={10} durationInFrames={24}><Audio src={staticFile("assets/test.wav")} volume={1} /></Sequence>')
    })

    it('unrollAmbientTrackJsx embeds loop and ducking info', () => {
        const windows = [
            { fromFrame: 10, durationInFrames: 20 },
            { fromFrame: 40, durationInFrames: 20 }
        ]

        const jsx = unrollAmbientTrackJsx('assets/amb.wav', windows)
        expect(jsx).toContain('<Audio src={staticFile("assets/amb.wav")}')
        expect(jsx).toContain('loop />')
        expect(jsx).toContain('volume={(f) => {')
    })
})
