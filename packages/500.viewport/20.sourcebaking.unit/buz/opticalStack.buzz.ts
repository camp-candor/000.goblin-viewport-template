import { OpticalBit } from '../fce/optical.bit'
import {
    ShotScopingPlan,
    OpticalPressOutput,
    OpticalScopingReceipt,
} from '../fce/optical.interface'

/**
 * [TASK-VT-7.1] Sequence-Relative Camera Subcomponent Wrapper.
 * Synthesizes dedicated React wrapper components wrapping useCurrentFrame()
 * locally to guarantee t=0 reset upon cut transitions.
 */
export const generateShotCameraWrapperCode = (
    shotIndex: number,
    durationInFrames: number,
    transformOrigin: string,
    zoomScale: number,
): string => {
    const shotNum = String(shotIndex).padStart(2, '0')
    const targetScale = zoomScale.toFixed(2)

    return `const Shot${shotNum}CameraWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const localFrame = useCurrentFrame();
  const scale = interpolate(localFrame, [0, ${durationInFrames}], [1.0, ${targetScale}], {
    extrapolateRight: 'clamp'
  });

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transformOrigin: '${transformOrigin}',
        transform: \`scale(\${scale})\`,
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
};`
}

/**
 * [TASK-VT-7.2] Multi-Layer Optical Hierarchy Stacking.
 * Synthesizes four explicit optical layer planes with strict z-index stacking.
 */
export const generateOpticalStackJsx = (shot: ShotScopingPlan): string => {
    const shotNum = String(shot.shotIndex).padStart(2, '0')
    const layers = shot.opticalLayers

    const despillFilter = layers.greenDespillEnabled
        ? `filter: 'brightness(0.98) saturate(0.95)'`
        : `filter: 'none'`

    const contactShadowStyle = layers.contactShadowEnabled
        ? `filter: 'drop-shadow(0px 20px 10px rgba(0,0,0,0.5))'`
        : ''

    const subtitleJsx = layers.vectorSubtitleText
        ? `          <div style={{ position: 'absolute', bottom: 80, width: '100%', textAlign: 'center', color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            ${layers.vectorSubtitleText}
          </div>`
        : ''

    return `      {/* SHOT ${shotNum} OPTICAL COMPOSITION */}
      <Sequence from={${shot.fromFrame}} durationInFrames={${shot.durationInFrames}}>
        <Shot${shotNum}CameraWrapper>
          {/* Layer 1: Static Environment Matte */}
          <div style={{ position: 'absolute', width: 1920, height: 1080, zIndex: 10 }}>
            <Img src={staticFile("${layers.environmentMattePath}")} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Layer 2: Vector Typography Dynamics */}
          <div style={{ position: 'absolute', width: 1920, height: 1080, zIndex: 20, pointerEvents: 'none' }}>
${subtitleJsx}
          </div>

          {/* Layer 3: Chroma Despilled Character Plane */}
          <div style={{ position: 'absolute', width: 1920, height: 1080, zIndex: 30, ${despillFilter} }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', ${contactShadowStyle} }}>
              <GoblinPuppet
                character="${layers.characterName}"
                emotion="${layers.emotion}"
              />
            </div>
          </div>

          {/* Layer 4: Optical Mastering Lens Simulation */}
          <div
            style={{
              position: 'absolute',
              width: 1920,
              height: 1080,
              zIndex: 40,
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)',
              mixBlendMode: 'multiply'
            }}
          />
        </Shot${shotNum}CameraWrapper>
      </Sequence>`
}

export const synthesizeOpticalPressBundle = (
    shots: ShotScopingPlan[],
): OpticalPressOutput => {
    const wrappers = shots.map((s) =>
        generateShotCameraWrapperCode(
            s.shotIndex,
            s.durationInFrames,
            s.transformOrigin,
            s.zoomScale,
        ),
    )
    const stacks = shots.map((s) => generateOpticalStackJsx(s))

    return {
        cameraWrapperCode: wrappers.join('\n\n'),
        opticalStackJsx: stacks.join('\n\n'),
    }
}

export const runGenerateOpticalScopesBuzz = (
    ste: any,
    bale: OpticalBit,
    bal: { slv: Function; blk: Function },
): void => {
    try {
        const shots = bale.dat?.shots
        const episodeId = bale.dat?.episodeId || 'epXXX'

        if (!shots || shots.length === 0) {
            throw new Error(
                'ERR_EMPTY_SHOTS_LIST: Shot list required for optical scoping.',
            )
        }

        const output = synthesizeOpticalPressBundle(shots)

        const receipt: OpticalScopingReceipt = {
            status: 'SUCCESS',
            episodeId,
            shotCount: shots.length,
            synthesizedWrappers: shots.map(
                (s) =>
                    `Shot${String(s.shotIndex).padStart(2, '0')}CameraWrapper`,
            ),
        }

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: `>> [OK] [OPTICAL] Synthesized 4-layer optical press for ${shots.length} shots.`,
            dat: { output, receipt },
        })
    } catch (err: any) {
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: `>> [FAIL] [OPTICAL] Invariant violation: ${err.message}`,
            dat: { error: err.message },
        })
    }
}
