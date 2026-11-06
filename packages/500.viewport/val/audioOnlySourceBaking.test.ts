import { describe, it, expect } from 'vitest'
import { bakeStaticComposition } from '../20.sourcebaking.unit/buz/sourcebaking.buzz.js'
import type { BakeCompositionInput } from '../20.sourcebaking.unit/fce/sourcebaking.interface'

describe('audioOnlySourceBaking', () => {
    it('emits audio-only composition properly without GoblinPuppet or CameraWrapper', () => {
        const input: BakeCompositionInput = {
            episodeId: '999',
            seriesSlug: 'test-series',
            audioOnly: true,
            ambientWavPath: 'assets/ambient/room_tone.wav',
            foleyPlacements: [
                {
                    category: 'coffee_pour',
                    fromFrame: 10,
                    durationInFrames: 36,
                    src: 'assets/foley/coffee_pour_v1.wav'
                }
            ],
            shots: [
                {
                    shotIndex: 1,
                    fromFrame: 0,
                    durationInFrames: 24,
                    speakerId: 'bob',
                    characterName: 'Bob',
                    emotion: 'neutral',
                    dialogueText: 'Hello',
                    audioWavPath: 'assets/dialogue/bob_hello.wav'
                }
            ]
        }

        const receipt = bakeStaticComposition(input)
        expect(receipt.status).toBe('SUCCESS')

        // Check if Track 1, 2, 3 audio tags are emitted
        expect(receipt.sourceCode).toContain('<Audio src={staticFile("assets/ambient/room_tone.wav")}')
        expect(receipt.sourceCode).toContain('<Audio src={staticFile("assets/dialogue/bob_hello.wav")} volume={1} />')
        expect(receipt.sourceCode).toContain('<Audio src={staticFile("assets/foley/coffee_pour_v1.wav")} volume={1} />')

        // Check for unquoted integers
        expect(receipt.sourceCode).toContain('from={0}')
        expect(receipt.sourceCode).toContain('durationInFrames={24}')

        // Check that visual elements are not emitted
        expect(receipt.sourceCode).not.toContain('GoblinPuppet')
        expect(receipt.sourceCode).not.toContain('CameraWrapper')
        expect(receipt.sourceCode).toContain('RemotionRoot')
    })

    it('emits visual composition properly when audioOnly is false', () => {
        const input: BakeCompositionInput = {
            episodeId: '998',
            seriesSlug: 'test-series',
            audioOnly: false,
            shots: [
                {
                    shotIndex: 1,
                    fromFrame: 0,
                    durationInFrames: 24,
                    speakerId: 'bob',
                    characterName: 'Bob',
                    emotion: 'neutral',
                    dialogueText: 'Hello',
                    audioWavPath: 'assets/dialogue/bob_hello.wav',
                    anchorPoint: { x: 512, y: 512 },
                    mouthBoundingBox: { x: 0, y: 0, width: 64, height: 64 }
                }
            ]
        }

        const receipt = bakeStaticComposition(input)
        expect(receipt.status).toBe('SUCCESS')

        // Check that visual elements ARE emitted
        expect(receipt.sourceCode).toContain('GoblinPuppet')
        expect(receipt.sourceCode).toContain('Shot01CameraWrapper')
        expect(receipt.sourceCode).not.toContain('RemotionRoot')
    })

    it('throws ERR_FLOAT_FRAME_BOUNDS when given floating point bounds', () => {
        const input: BakeCompositionInput = {
            episodeId: '997',
            seriesSlug: 'test-series',
            audioOnly: true,
            shots: [
                {
                    shotIndex: 1,
                    fromFrame: 12.5,
                    durationInFrames: 24,
                    speakerId: 'bob',
                    characterName: 'Bob',
                    emotion: 'neutral',
                    dialogueText: 'Hello',
                    audioWavPath: 'assets/dialogue/bob_hello.wav'
                }
            ]
        }

        expect(() => bakeStaticComposition(input)).toThrow('ERR_FLOAT_FRAME_BOUNDS')
    })
})
