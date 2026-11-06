import { describe, it, expect } from 'vitest'
import { bakeStaticComposition } from '../20.sourcebaking.unit/buz/sourcebaking.buzz.js'
import { BakeCompositionInput } from '../20.sourcebaking.unit/fce/sourcebaking.interface.js'

describe('audioOnlySourceBaking', () => {
    const defaultShots = [
        {
            shotIndex: 1,
            fromFrame: 0,
            durationInFrames: 24,
            speakerId: 'speaker1',
            characterName: 'goblin',
            emotion: 'neutral',
            dialogueText: 'Hello',
            audioWavPath: 'hello.wav',
            anchorPoint: { x: 512, y: 512 },
            mouthBoundingBox: { x: 0, y: 0, width: 64, height: 64 }
        }
    ];

    it('emits Track 1, Track 2, and Track 3 Audio tags with unquoted int frame bounds and no GoblinPuppet when audioOnly is true', () => {
        const input: BakeCompositionInput = {
            episodeId: '001',
            seriesSlug: 'test',
            shots: defaultShots,
            audioOnly: true,
            ambientWavPath: 'ambient.wav',
            foleyPlacements: [
                { category: 'rain_squall', fromFrame: 5, durationInFrames: 10, src: 'rain.wav' }
            ]
        };

        const receipt = bakeStaticComposition(input);
        expect(receipt.status).toBe('SUCCESS');

        // Unquoted ints and proper audio src
        expect(receipt.sourceCode).toContain('from={0} durationInFrames={24}');
        expect(receipt.sourceCode).toContain('<Audio src={staticFile("hello.wav")} volume={1.0} />');

        // Ambient
        expect(receipt.sourceCode).toContain('<Audio src={staticFile("ambient.wav")}');

        // Foley
        expect(receipt.sourceCode).toContain('from={5} durationInFrames={10}');
        expect(receipt.sourceCode).toContain('<Audio src={staticFile("rain.wav")}');

        // No visual stuff
        expect(receipt.sourceCode).not.toContain('GoblinPuppet');
        expect(receipt.sourceCode).not.toContain('Shot01CameraWrapper');

        // RemotionRoot exists
        expect(receipt.sourceCode).toContain('export const RemotionRoot');
    });

    it('emits standard visual code with GoblinPuppet when audioOnly is false', () => {
        const input: BakeCompositionInput = {
            episodeId: '001',
            seriesSlug: 'test',
            shots: defaultShots,
            audioOnly: false,
        };

        const receipt = bakeStaticComposition(input);
        expect(receipt.status).toBe('SUCCESS');

        expect(receipt.sourceCode).toContain('import { GoblinPuppet } from \'./components/GoblinPuppet\';');
        expect(receipt.sourceCode).toContain('<GoblinPuppet');
        expect(receipt.sourceCode).toContain('Shot01CameraWrapper');
    });

    it('throws ERR_FLOAT_FRAME_BOUNDS when frame bounds are floats', () => {
        const input: BakeCompositionInput = {
            episodeId: '001',
            seriesSlug: 'test',
            shots: [
                { ...defaultShots[0], fromFrame: 12.5 }
            ],
            audioOnly: true
        };

        expect(() => bakeStaticComposition(input)).toThrow('ERR_FLOAT_FRAME_BOUNDS');
    });
});
