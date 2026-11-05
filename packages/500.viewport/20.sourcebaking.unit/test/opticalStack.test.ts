import { describe, it, expect } from 'vitest'
import {
    generateShotCameraWrapperCode,
    generateOpticalStackJsx,
    synthesizeOpticalPressBundle,
} from '../buz/opticalStack.buzz'
import { ShotScopingPlan } from '../fce/optical.interface'

describe('20.sourcebaking.unit: Optical Press Scoping Sequence Wrapping', () => {
    const sampleShot: ShotScopingPlan = {
        shotIndex: 1,
        fromFrame: 0,
        durationInFrames: 75,
        transformOrigin: '50.00% 95.70%',
        zoomScale: 1.15,
        opticalLayers: {
            environmentMattePath: 'environments/env_swamp/swamp_matte.png',
            vectorSubtitleText: 'The subterranean joists are dry.',
            characterName: 'char_bog',
            emotion: 'humiliated',
            greenDespillEnabled: true,
            contactShadowEnabled: true,
            lensSimulationEnabled: true,
        },
    }

    it('[TASK-VT-7.1] generates sequence-relative camera wrapper with local useCurrentFrame hook', () => {
        const wrapper = generateShotCameraWrapperCode(
            sampleShot.shotIndex,
            sampleShot.durationInFrames,
            sampleShot.transformOrigin,
            sampleShot.zoomScale,
        )

        expect(wrapper).toContain('const Shot01CameraWrapper: React.FC')
        expect(wrapper).toContain('const localFrame = useCurrentFrame();')
        expect(wrapper).toContain("transformOrigin: '50.00% 95.70%'")
        expect(wrapper).toContain(
            'interpolate(localFrame, [0, 75], [1.0, 1.15]',
        )
    })

    it('[TASK-VT-7.2] synthesizes the four-layer optical stack with strict z-index ordering', () => {
        const jsx = generateOpticalStackJsx(sampleShot)

        expect(jsx).toContain('{/* Layer 1: Static Environment Matte */}')
        expect(jsx).toContain('zIndex: 10')
        expect(jsx).toContain('swamp_matte.png')

        expect(jsx).toContain('{/* Layer 2: Vector Typography Dynamics */}')
        expect(jsx).toContain('zIndex: 20')
        expect(jsx).toContain('The subterranean joists are dry.')

        expect(jsx).toContain(
            '{/* Layer 3: Chroma Despilled Character Plane */}',
        )
        expect(jsx).toContain('zIndex: 30')
        expect(jsx).toContain('GoblinPuppet')
        expect(jsx).toContain(
            "filter: 'drop-shadow(0px 20px 10px rgba(0,0,0,0.5))'",
        )

        expect(jsx).toContain(
            '{/* Layer 4: Optical Mastering Lens Simulation */}',
        )
        expect(jsx).toContain('zIndex: 40')
        expect(jsx).toContain("mixBlendMode: 'multiply'")
    })

    it('guarantees pure 7-bit ASCII compliance across emitted wrapper code and optical stack', () => {
        const bundle = synthesizeOpticalPressBundle([sampleShot])
        const nonAsciiRegex = /[^\x00-\x7F]/

        expect(nonAsciiRegex.test(bundle.cameraWrapperCode)).toBe(false)
        expect(nonAsciiRegex.test(bundle.opticalStackJsx)).toBe(false)
    })
})
