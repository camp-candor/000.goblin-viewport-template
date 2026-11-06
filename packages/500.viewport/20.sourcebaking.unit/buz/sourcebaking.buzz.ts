import { SourceBakingBit } from '../fce/sourcebaking.bit'
import {
    BakeCompositionInput,
    BakeShotPlan,
    BakeReceipt,
    CoordinateProjection,
} from '../fce/sourcebaking.interface'
import { unrollFoleySequencesJsx } from '../../10.foley.unit/buz/foley.buzz.js'
import { unrollAmbientTrackJsx, SpeechWindowSpec } from '../../02.ambience.unit/buz/ambience.buzz.js'

export const CANONICAL_WIDTH = 1920
export const CANONICAL_HEIGHT = 1080
export const SPRITE_GRID_SIZE = 1024

/**
 * [TASK-VT-3.3] Coordinate Normalization Matrix Projection.
 * Projects sprite anchor coordinates (1024x1024) onto canonical 1920x1080 canvas,
 * returning normalized percentage strings for transform-origin CSS styling.
 */
export const projectCoordinatePercentages = (
    localX: number,
    localY: number,
    canvasWidth: number = CANONICAL_WIDTH,
    canvasHeight: number = CANONICAL_HEIGHT,
): CoordinateProjection => {
    if (localX < 0 || localY < 0) {
        throw new Error(
            'ERR_NEGATIVE_COORDINATES: Coordinates cannot be negative.',
        )
    }

    // Scale local sprite coordinate to master canvas space
    const scaledX = (localX / SPRITE_GRID_SIZE) * canvasWidth
    const scaledY = (localY / SPRITE_GRID_SIZE) * canvasHeight

    const originXPercent = ((scaledX / canvasWidth) * 100).toFixed(2) + '%'
    const originYPercent = ((scaledY / canvasHeight) * 100).toFixed(2) + '%'

    return {
        originXPercent,
        originYPercent,
    }
}

/**
 * [TASK-VT-3.2] Unquoted Integer Numeric Bounds Inlining.
 * Returns JSX attribute string with unquoted numeric literals.
 */
export const inlineExposureAttributes = (
    fromFrame: number,
    durationInFrames: number,
    volume: number = 1.0,
): string => {
    if (!Number.isInteger(fromFrame) || !Number.isInteger(durationInFrames)) {
        throw new Error(
            'ERR_FLOAT_FRAME_BOUNDS: Frame boundaries must be unquoted integers.',
        )
    }
    return `from={${fromFrame}} durationInFrames={${durationInFrames}} volume={${volume.toFixed(1)}}`
}

export const unrollAudioOnlyDialogueShots = (shots: BakeShotPlan[]): string => {
    return shots
        .map((shot) => {
            if (!Number.isInteger(shot.fromFrame) || shot.fromFrame < 0 || !Number.isInteger(shot.durationInFrames) || shot.durationInFrames < 0) {
                throw new Error('ERR_FLOAT_FRAME_BOUNDS: Frame boundaries must be unquoted integers.')
            }

            const shotNumStr = String(shot.shotIndex).padStart(2, '0')
            const volumeLevel = shot.sidechainDuckingDb ? 0.2 : 1.0

            return `      {/* SHOT ${shotNumStr} AUDIO-ONLY SEQUENCE */}
      <Sequence from={${shot.fromFrame}} durationInFrames={${shot.durationInFrames}}>
        <Audio src={staticFile("${shot.audioWavPath}")} volume={${volumeLevel}} />
      </Sequence>`
        })
        .join('\n\n')
}

/**
 * [TASK-VT-3.1] Dynamic Array Mapping Eradication.
 * Unrolls shot array into static, unrolled JSX string blocks at compile time.
 */
export const unrollDialogueShots = (
    shots: BakeShotPlan[],
    canvasWidth: number = CANONICAL_WIDTH,
    canvasHeight: number = CANONICAL_HEIGHT,
): string => {
    return shots
        .map((shot) => {
            if (!Number.isInteger(shot.fromFrame) || shot.fromFrame < 0 || !Number.isInteger(shot.durationInFrames) || shot.durationInFrames < 0) {
                throw new Error('ERR_FLOAT_FRAME_BOUNDS: Frame boundaries must be unquoted integers.')
            }

            const anchorPoint = shot.anchorPoint || { x: 512, y: 512 }
            const mouthBoundingBox = shot.mouthBoundingBox || { x: 0, y: 0, width: 64, height: 64 }

            const projection = projectCoordinatePercentages(
                anchorPoint.x,
                anchorPoint.y,
                canvasWidth,
                canvasHeight,
            )

            const shotNumStr = String(shot.shotIndex).padStart(2, '0')
            const volumeLevel = shot.sidechainDuckingDb ? 0.2 : 1.0

            return `      {/* SHOT ${shotNumStr} STATIC SEQUENCE */}
      <Sequence from={${shot.fromFrame}} durationInFrames={${shot.durationInFrames}}>
        <Shot${shotNumStr}CameraWrapper style={{ transformOrigin: '${projection.originXPercent} ${projection.originYPercent}' }}>
          <GoblinPuppet
            character="${shot.characterName}"
            emotion="${shot.emotion}"
            anchorPoint={{ x: ${anchorPoint.x}, y: ${anchorPoint.y} }}
            mouthBoundingBox={{ x: ${mouthBoundingBox.x}, y: ${mouthBoundingBox.y}, width: ${mouthBoundingBox.width}, height: ${mouthBoundingBox.height} }}
          />
          <Audio src={staticFile("${shot.audioWavPath}")} volume={${volumeLevel}} />
        </Shot${shotNumStr}CameraWrapper>
      </Sequence>`
        })
        .join('\n\n')
}

/**
 * Generates the complete, self-contained React composition file Episode_XXX.tsx.
 */
export const bakeStaticComposition = (
    input: BakeCompositionInput,
): BakeReceipt => {
    if (!input.shots || input.shots.length === 0) {
        throw new Error(
            'ERR_EMPTY_SHOT_PLAN: Cannot bake static composition with 0 shots.',
        )
    }

    const canvasWidth = input.canvasWidth ?? CANONICAL_WIDTH
    const canvasHeight = input.canvasHeight ?? CANONICAL_HEIGHT

    const lastShot = input.shots[input.shots.length - 1]
    const totalDurationFrames = lastShot.fromFrame + lastShot.durationInFrames

    let sourceCode = ''

    if (input.audioOnly) {
        for (const shot of input.shots) {
            if (!Number.isInteger(shot.fromFrame) || shot.fromFrame < 0 || !Number.isInteger(shot.durationInFrames) || shot.durationInFrames < 0) {
                throw new Error('ERR_FLOAT_FRAME_BOUNDS: Frame boundaries must be unquoted integers.')
            }
        }

        const speechWindows: SpeechWindowSpec[] = input.shots.map(s => ({ fromFrame: s.fromFrame, durationInFrames: s.durationInFrames }))
        const ambientTrackJsx = input.ambientWavPath ? unrollAmbientTrackJsx(input.ambientWavPath, speechWindows) : ''
        const dialogueJsx = unrollAudioOnlyDialogueShots(input.shots)
        const foleyJsx = unrollFoleySequencesJsx(input.foleyPlacements || [])

        sourceCode = `// @lifecycle: generated
// @series: ${input.seriesSlug}
// @episode: ${input.episodeId}
// @total_frames: ${totalDurationFrames}

import React from 'react';
import { Composition, Sequence, Audio, staticFile } from 'remotion';

export const Episode_${input.episodeId}: React.FC = () => {
  return (
    <div style={{ width: ${canvasWidth}, height: ${canvasHeight}, backgroundColor: '#000000', position: 'relative' }}>
      {/* TRACK 3: AMBIENT */}
      ${ambientTrackJsx}

      {/* TRACK 1: DIALOGUE */}
${dialogueJsx}

      {/* TRACK 2: FOLEY */}
      ${foleyJsx}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Episode_${input.episodeId}"
                component={Episode_${input.episodeId}}
                durationInFrames={${totalDurationFrames}}
                fps={24}
                width={${canvasWidth}}
                height={${canvasHeight}}
            />
        </>
    );
};
`
    } else {
        const unrolledSequences = unrollDialogueShots(
            input.shots,
            canvasWidth,
            canvasHeight,
        )

        // Synthesize camera wrapper subcomponents for hook isolation
        const cameraWrappers = input.shots
            .map((shot) => {
                const shotNumStr = String(shot.shotIndex).padStart(2, '0')
                return `const Shot${shotNumStr}CameraWrapper: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', ...style }}>
      {children}
    </div>
  );
};`
            })
            .join('\n\n')

        sourceCode = `// @lifecycle: generated
// @series: ${input.seriesSlug}
// @episode: ${input.episodeId}
// @total_frames: ${totalDurationFrames}

import React from 'react';
import { Composition, Sequence, Audio, staticFile, useCurrentFrame } from 'remotion';
import { GoblinPuppet } from './components/GoblinPuppet';

${cameraWrappers}

export const Episode_${input.episodeId}: React.FC = () => {
  return (
    <div style={{ width: ${canvasWidth}, height: ${canvasHeight}, backgroundColor: '#000000', position: 'relative' }}>
${unrolledSequences}
    </div>
  );
};
`
    }

    return {
        status: 'SUCCESS',
        episodeId: input.episodeId,
        totalDurationFrames,
        shotCount: input.shots.length,
        sourceCode,
    }
}

export const runBakeStaticCompositionBuzz = (
    ste: any,
    bale: SourceBakingBit,
    bal: { slv: Function; blk: Function },
): void => {
    try {
        const input = bale.dat?.input
        if (!input) {
            throw new Error('ERR_MISSING_INPUT: bale.dat.input is required.')
        }

        const receipt = bakeStaticComposition(input)

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: '>> [OK] [BAKE] Static React composition emitted without dynamic loops.',
            dat: { receipt },
        })
    } catch (err: any) {
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: `>> [FAIL] [BAKE] Invariant violation: ${err.message}`,
            dat: { error: err.message },
        })
    }
}
