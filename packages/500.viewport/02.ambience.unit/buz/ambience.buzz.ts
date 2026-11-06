import { AmbienceModel } from '../ambience.model'
import AmbienceBit from '../fce/ambience.bit'
import State from '../../99.core/state'
import { routeTelemetryToConsole } from '../../99.bus.unit/buz/bus.buzz.js'

export const initAmbience = (
    cpy: AmbienceModel,
    bal: AmbienceBit,
    ste: State,
) => {
    if (bal.slv) bal.slv({ ambienceBit: bal })
    routeTelemetryToConsole(`[AMBIENCE] Unit init: ${bal.idx}`)
    return cpy
}

export const updateAmbience = (
    cpy: AmbienceModel,
    bal: AmbienceBit,
    ste: State,
) => {
    if (bal.slv) bal.slv({ ambienceBit: bal })
    routeTelemetryToConsole(`[AMBIENCE] Unit update: ${bal.idx}`)
    return cpy
}

export const runCompileAmbienceBuzz = (
    cpy: AmbienceModel,
    bal: AmbienceBit,
    ste: State,
) => {
    if (bal.slv) bal.slv({ ambienceBit: bal })
    routeTelemetryToConsole(`[AMBIENCE] Buzz runCompileAmbience: ${bal.idx}`)
    return cpy
}

export interface SpeechWindowSpec {
    fromFrame: number;
    durationInFrames: number;
}

export const mergeSpeechWindows = (windows: SpeechWindowSpec[], maxGapFrames = 18): SpeechWindowSpec[] => {
    if (windows.length === 0) return [];

    const sorted = [...windows].sort((a, b) => a.fromFrame - b.fromFrame);
    const merged: SpeechWindowSpec[] = [{ ...sorted[0] }];

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const last = merged[merged.length - 1];

        const lastEnd = last.fromFrame + last.durationInFrames;

        if (current.fromFrame - lastEnd <= maxGapFrames) {
            const newEnd = Math.max(lastEnd, current.fromFrame + current.durationInFrames);
            last.durationInFrames = newEnd - last.fromFrame;
        } else {
            merged.push({ ...current });
        }
    }

    return merged;
}

export const computeAmbientDuckingCurve = (
    totalFrames: number,
    windows: SpeechWindowSpec[],
    floorDb = -14.0,
    attackFrames = 6,
    releaseFrames = 12
): number[] => {
    const floorLinear = Math.pow(10, floorDb / 20);
    const curve = new Array(totalFrames).fill(1.0);

    for (const win of windows) {
        const start = win.fromFrame;
        const end = win.fromFrame + win.durationInFrames;

        for (let i = start; i < end; i++) {
            if (i >= 0 && i < totalFrames) curve[i] = floorLinear;
        }

        // Attack
        for (let i = 1; i <= attackFrames; i++) {
            const frame = start - i;
            if (frame >= 0 && frame < totalFrames) {
                const t = i / attackFrames;
                const val = floorLinear + (1.0 - floorLinear) * (t * t);
                curve[frame] = Math.min(curve[frame], val);
            }
        }

        // Release
        for (let i = 1; i <= releaseFrames; i++) {
            const frame = end + i - 1;
            if (frame >= 0 && frame < totalFrames) {
                const t = i / releaseFrames;
                const val = floorLinear + (1.0 - floorLinear) * (t * t);
                curve[frame] = Math.min(curve[frame], val);
            }
        }
    }

    return curve;
}

export const unrollAmbientTrackJsx = (
    ambientWavPath: string,
    windows: SpeechWindowSpec[],
    baseVolume = 0.35,
    duckedVolume = 0.20
): string => {
    for (const w of windows) {
        if (!Number.isInteger(w.fromFrame) || w.fromFrame < 0 || !Number.isInteger(w.durationInFrames) || w.durationInFrames < 0) {
            throw new Error(`ERR_FLOAT_FOLEY_FRAME: Invalid frame ${w.fromFrame} or duration ${w.durationInFrames}`);
        }
    }

    let volFuncStr = `(f) => {
    const windows = ${JSON.stringify(windows)};
    const baseVolume = ${baseVolume};
    const duckedVolume = ${duckedVolume};
    for (const w of windows) {
        if (f >= w.fromFrame && f < w.fromFrame + w.durationInFrames) return duckedVolume;
    }
    return baseVolume;
}`;

    return `<Audio src={staticFile("${ambientWavPath}")} volume={${volFuncStr}} loop />`;
}
