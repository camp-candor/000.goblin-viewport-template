import { AmbienceModel } from '../ambience.model.js'
import AmbienceBit from '../fce/ambience.bit.js'
import State from '../../99.core/state.js'
import { routeTelemetryToConsole } from '../../99.bus.unit/buz/bus.buzz.js'
import { SpeechWindowSpec } from '../fce/ambience.interface.js'

export const initAmbience = (
    cpy: AmbienceModel,
    bal: AmbienceBit,
    ste: State,
) => {
    return cpy
}

export const updateAmbience = (
    cpy: AmbienceModel,
    bal: AmbienceBit,
    ste: State,
) => {
    return cpy
}

export function mergeSpeechWindows(windows: SpeechWindowSpec[], maxGapFrames = 18): SpeechWindowSpec[] {
    if (!windows || windows.length === 0) return []

    // Sort by fromFrame
    const sorted = [...windows].sort((a, b) => a.fromFrame - b.fromFrame)

    const merged: SpeechWindowSpec[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
        const curr = merged[merged.length - 1]
        const next = sorted[i]

        const currEnd = curr.fromFrame + curr.durationInFrames

        if (next.fromFrame - currEnd <= maxGapFrames) {
            // Merge
            const newEnd = Math.max(currEnd, next.fromFrame + next.durationInFrames)
            curr.durationInFrames = newEnd - curr.fromFrame
        } else {
            merged.push(next)
        }
    }

    return merged
}

export function computeAmbientDuckingCurve(totalFrames: number, windows: SpeechWindowSpec[], floorDb = -14.0, attackFrames = 6, releaseFrames = 12): number[] {
    const duckedLinear = Math.pow(10, floorDb / 20) // approx 0.1995
    const curve = new Array(totalFrames).fill(1.0)

    for (const w of windows) {
        const start = w.fromFrame
        const end = w.fromFrame + w.durationInFrames

        // Fully ducked inside window
        for (let i = start; i < end && i < totalFrames; i++) {
            if (i >= 0) curve[i] = duckedLinear
        }

        // Quadratic attack (decreasing volume)
        for (let i = 0; i < attackFrames; i++) {
            const frameIndex = start - attackFrames + i
            if (frameIndex >= 0 && frameIndex < totalFrames) {
                // from 1 down to duckedLinear
                const t = i / attackFrames // 0 to 1
                const v = 1.0 - (1.0 - duckedLinear) * (t * t)
                if (v < curve[frameIndex]) curve[frameIndex] = v
            }
        }

        // Quadratic release (increasing volume)
        for (let i = 0; i < releaseFrames; i++) {
            const frameIndex = end + i
            if (frameIndex >= 0 && frameIndex < totalFrames) {
                // from duckedLinear up to 1
                const t = i / releaseFrames // 0 to 1
                const v = duckedLinear + (1.0 - duckedLinear) * (t * t)
                if (v < curve[frameIndex]) curve[frameIndex] = v
            }
        }
    }

    return curve
}

export function unrollAmbientTrackJsx(ambientWavPath: string, windows: SpeechWindowSpec[], baseVolume = 0.35, duckedVolume = 0.20): string {
    const merged = mergeSpeechWindows(windows)

    // We implement the ducking logic within the outputted static block.
    // The instruction: "-14.0 dB / 0.1995 linear floor with 6-frame quadratic attack and 12-frame quadratic release"
    // Since duckedVolume (0.20) represents the floor.

    let volFuncBody = `const vol = ${baseVolume};\n`
    volFuncBody += `  const ducked = ${duckedVolume};\n`
    volFuncBody += `  const attack = 6;\n`
    volFuncBody += `  const release = 12;\n`

    for (const w of merged) {
        const s = w.fromFrame
        const e = w.fromFrame + w.durationInFrames

        volFuncBody += `  if (f >= ${s} && f < ${e}) return ducked;\n`

        // Attack logic
        volFuncBody += `  if (f >= ${s - 6} && f < ${s}) {\n`
        volFuncBody += `    const t = (f - (${s} - attack)) / attack;\n`
        volFuncBody += `    return vol - (vol - ducked) * (t * t);\n`
        volFuncBody += `  }\n`

        // Release logic
        volFuncBody += `  if (f >= ${e} && f < ${e + 12}) {\n`
        volFuncBody += `    const t = (f - ${e}) / release;\n`
        volFuncBody += `    return ducked + (vol - ducked) * (t * t);\n`
        volFuncBody += `  }\n`
    }

    volFuncBody += `  return vol;`

    return `<Audio src={staticFile("${ambientWavPath}")} volume={(f) => {\n  ${volFuncBody}\n}} loop />`
}

export const runCompileAmbienceBuzz = (ste: State, bale: AmbienceBit, bal: AmbienceBit & { slv: Function; blk: Function }) => {
    try {
        const wavPath = bale.dat?.ambientWavPath || 'music/ambient/amb_diner_rain_hum.wav'
        const windows = bale.dat?.windows || []

        const jsxString = unrollAmbientTrackJsx(wavPath, windows)

        routeTelemetryToConsole(`[AMBIENCE] Compiled ambience with ${windows.length} windows`)

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: jsxString,
            dat: { jsxString }
        })
    } catch (err: any) {
        routeTelemetryToConsole(`[AMBIENCE_ERR] ${err.message}`)
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: err.message,
            dat: { error: err.message }
        })
    }
}
