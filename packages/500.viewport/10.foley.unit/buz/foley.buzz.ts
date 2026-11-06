import { FoleyModel } from '../foley.model'
import FoleyBit from '../fce/foley.bit'
import State from '../../99.core/state'
import { routeTelemetryToConsole } from '../../99.bus.unit/buz/bus.buzz.js'

export const initFoley = (cpy: FoleyModel, bal: FoleyBit, ste: State) => {
    if (bal.slv) bal.slv({ foleyBit: bal })
    routeTelemetryToConsole(`[FOLEY] Unit init: ${bal.idx}`)
    return cpy
}

export const updateFoley = (cpy: FoleyModel, bal: FoleyBit, ste: State) => {
    if (bal.slv) bal.slv({ foleyBit: bal })
    routeTelemetryToConsole(`[FOLEY] Unit update: ${bal.idx}`)
    return cpy
}

export const runResolveFoleyBuzz = (cpy: FoleyModel, bal: FoleyBit, ste: State) => {
    if (bal.slv) bal.slv({ foleyBit: bal })
    routeTelemetryToConsole(`[FOLEY] Buzz runResolveFoley: ${bal.idx}`)
    return cpy
}

export const murmurHash3 = (key: string, seed = 0): number => {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < key.length; i++) {
        ch = key.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export const mulberry32 = (seed: number): () => number => {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export const PARALLAX_FOLEY_CATALOG: Record<string, { triggers: string[], durationInFrames: number, variants: string[] }> = {
    rain_squall: { triggers: ['rain', 'squall'], durationInFrames: 48, variants: ['assets/foley/rain_squall_v1.wav', 'assets/foley/rain_squall_v2.wav', 'assets/foley/rain_squall_v3.wav'] },
    diesel_idle: { triggers: ['diesel', 'idle'], durationInFrames: 72, variants: ['assets/foley/diesel_idle_v1.wav', 'assets/foley/diesel_idle_v2.wav', 'assets/foley/diesel_idle_v3.wav'] },
    door_hiss: { triggers: ['door', 'hiss'], durationInFrames: 24, variants: ['assets/foley/door_hiss_v1.wav', 'assets/foley/door_hiss_v2.wav', 'assets/foley/door_hiss_v3.wav'] },
    booth_creak: { triggers: ['booth', 'creak'], durationInFrames: 24, variants: ['assets/foley/booth_creak_v1.wav', 'assets/foley/booth_creak_v2.wav', 'assets/foley/booth_creak_v3.wav'] },
    menu_drop: { triggers: ['menu', 'drop'], durationInFrames: 12, variants: ['assets/foley/menu_drop_v1.wav', 'assets/foley/menu_drop_v2.wav', 'assets/foley/menu_drop_v3.wav'] },
    coffee_pour: { triggers: ['coffee', 'pour'], durationInFrames: 36, variants: ['assets/foley/coffee_pour_v1.wav', 'assets/foley/coffee_pour_v2.wav', 'assets/foley/coffee_pour_v3.wav'] },
    wipe_tear: { triggers: ['wipe', 'tear'], durationInFrames: 16, variants: ['assets/foley/wipe_tear_v1.wav', 'assets/foley/wipe_tear_v2.wav', 'assets/foley/wipe_tear_v3.wav'] },
    lens_click: { triggers: ['lens', 'click'], durationInFrames: 8, variants: ['assets/foley/lens_click_v1.wav', 'assets/foley/lens_click_v2.wav', 'assets/foley/lens_click_v3.wav'] },
    semi_pass: { triggers: ['semi', 'pass'], durationInFrames: 60, variants: ['assets/foley/semi_pass_v1.wav', 'assets/foley/semi_pass_v2.wav', 'assets/foley/semi_pass_v3.wav'] },
}

export interface FoleyPlacementSpec {
    category: string;
    fromFrame: number;
    durationInFrames: number;
    src: string;
}

export const resolveFoleyPlacements = (
    sceneId: string,
    cues: Array<{ text: string; fromFrame: number; durationInFrames?: number }>
): FoleyPlacementSpec[] => {
    const placements: FoleyPlacementSpec[] = [];
    const lastCategoryHit: Record<string, { frame: number; variantIndex: number }> = {};

    for (const cue of cues) {
        let category: string | null = null;
        const textLow = cue.text.toLowerCase();

        for (const [cat, spec] of Object.entries(PARALLAX_FOLEY_CATALOG)) {
            for (const trig of spec.triggers) {
                if (textLow.includes(trig)) {
                    category = cat;
                    break;
                }
            }
            if (category) break;
        }

        if (!category) continue;

        const spec = PARALLAX_FOLEY_CATALOG[category];
        const duration = cue.durationInFrames || spec.durationInFrames;
        let seed = murmurHash3(`${sceneId}:${category}:${cue.fromFrame}`);
        let rand = mulberry32(seed);
        let variantIndex = Math.floor(rand() * spec.variants.length);

        const last = lastCategoryHit[category];
        if (last && (cue.fromFrame - last.frame) < 120 && last.variantIndex === variantIndex) {
            seed = murmurHash3(`${sceneId}:${category}:${cue.fromFrame}:retry1`);
            rand = mulberry32(seed);
            variantIndex = (variantIndex + 1 + Math.floor(rand() * (spec.variants.length - 1))) % spec.variants.length;
        }

        lastCategoryHit[category] = { frame: cue.fromFrame, variantIndex };

        placements.push({
            category,
            fromFrame: cue.fromFrame,
            durationInFrames: duration,
            src: spec.variants[variantIndex]
        });
    }

    return placements;
}

export const unrollFoleySequencesJsx = (placements: FoleyPlacementSpec[]): string => {
    let result = '';
    for (const p of placements) {
        if (!Number.isInteger(p.fromFrame) || p.fromFrame < 0 || !Number.isInteger(p.durationInFrames) || p.durationInFrames < 0) {
            throw new Error(`ERR_FLOAT_FOLEY_FRAME: Invalid frame ${p.fromFrame} or duration ${p.durationInFrames}`);
        }
        result += `<Sequence from={${p.fromFrame}} durationInFrames={${p.durationInFrames}}><Audio src={staticFile("${p.src}")} volume={1} /></Sequence>`;
    }
    return result;
}
