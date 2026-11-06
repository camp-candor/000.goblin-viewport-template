import { FoleyModel } from '../foley.model.js'
import FoleyBit from '../fce/foley.bit.js'
import State from '../../99.core/state.js'
import { routeTelemetryToConsole } from '../../99.bus.unit/buz/bus.buzz.js'
import { FoleyPlacementSpec } from '../fce/foley.interface.js'

export const initFoley = (cpy: FoleyModel, bal: FoleyBit, ste: State) => {
    return cpy
}

export const updateFoley = (cpy: FoleyModel, bal: FoleyBit, ste: State) => {
    return cpy
}

export function murmurHash3(key: string, seed = 0): number {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < key.length; i++) {
        ch = key.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function mulberry32(seed: number): () => number {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export const PARALLAX_FOLEY_CATALOG: Record<string, { triggers: string[], durationInFrames: number, variants: string[] }> = {
    rain_squall: {
        triggers: ['rain', 'squall', 'storm'],
        durationInFrames: 24,
        variants: ['assets/foley/rain_squall_v1.wav', 'assets/foley/rain_squall_v2.wav', 'assets/foley/rain_squall_v3.wav']
    },
    diesel_idle: {
        triggers: ['diesel', 'idle', 'truck'],
        durationInFrames: 24,
        variants: ['assets/foley/diesel_idle_v1.wav', 'assets/foley/diesel_idle_v2.wav', 'assets/foley/diesel_idle_v3.wav']
    },
    door_hiss: {
        triggers: ['door', 'hiss', 'open', 'close'],
        durationInFrames: 24,
        variants: ['assets/foley/door_hiss_v1.wav', 'assets/foley/door_hiss_v2.wav', 'assets/foley/door_hiss_v3.wav']
    },
    booth_creak: {
        triggers: ['booth', 'creak', 'seat'],
        durationInFrames: 24,
        variants: ['assets/foley/booth_creak_v1.wav', 'assets/foley/booth_creak_v2.wav', 'assets/foley/booth_creak_v3.wav']
    },
    menu_drop: {
        triggers: ['menu', 'drop', 'table'],
        durationInFrames: 24,
        variants: ['assets/foley/menu_drop_v1.wav', 'assets/foley/menu_drop_v2.wav', 'assets/foley/menu_drop_v3.wav']
    },
    coffee_pour: {
        triggers: ['coffee', 'pour', 'cup'],
        durationInFrames: 24,
        variants: ['assets/foley/coffee_pour_v1.wav', 'assets/foley/coffee_pour_v2.wav', 'assets/foley/coffee_pour_v3.wav']
    },
    wipe_tear: {
        triggers: ['wipe', 'tear', 'cry'],
        durationInFrames: 24,
        variants: ['assets/foley/wipe_tear_v1.wav', 'assets/foley/wipe_tear_v2.wav', 'assets/foley/wipe_tear_v3.wav']
    },
    lens_click: {
        triggers: ['lens', 'click', 'camera'],
        durationInFrames: 24,
        variants: ['assets/foley/lens_click_v1.wav', 'assets/foley/lens_click_v2.wav', 'assets/foley/lens_click_v3.wav']
    },
    semi_pass: {
        triggers: ['semi', 'pass', 'drive'],
        durationInFrames: 24,
        variants: ['assets/foley/semi_pass_v1.wav', 'assets/foley/semi_pass_v2.wav', 'assets/foley/semi_pass_v3.wav']
    }
}

export function resolveFoleyPlacements(sceneId: string, cues: Array<{ text: string; fromFrame: number; durationInFrames?: number }>): FoleyPlacementSpec[] {
    const placements: FoleyPlacementSpec[] = []

    // Store last played per category to apply anti-clustering
    const history: Record<string, { frame: number, variant: string }> = {}

    for (const cue of cues) {
        let matchedCategory = null
        for (const [category, spec] of Object.entries(PARALLAX_FOLEY_CATALOG)) {
            for (const trigger of spec.triggers) {
                if (cue.text.toLowerCase().includes(trigger)) {
                    matchedCategory = category
                    break
                }
            }
            if (matchedCategory) break
        }

        if (matchedCategory) {
            const catalogItem = PARALLAX_FOLEY_CATALOG[matchedCategory]
            let seed = murmurHash3(`${sceneId}:${matchedCategory}:${cue.fromFrame}`)
            let prng = mulberry32(seed)
            let variantIndex = Math.floor(prng() * catalogItem.variants.length)
            let variant = catalogItem.variants[variantIndex]

            // Anti-clustering check
            const last = history[matchedCategory]
            if (last && (cue.fromFrame - last.frame) < 120 && last.variant === variant) {
                seed = murmurHash3(`${sceneId}:${matchedCategory}:${cue.fromFrame}:retry1`)
                prng = mulberry32(seed)
                variantIndex = Math.floor(prng() * catalogItem.variants.length)

                // Still same? Just pick next one modulo to guarantee change
                if (catalogItem.variants[variantIndex] === variant) {
                    variantIndex = (variantIndex + 1) % catalogItem.variants.length
                }
                variant = catalogItem.variants[variantIndex]
            }

            history[matchedCategory] = { frame: cue.fromFrame, variant }

            placements.push({
                category: matchedCategory,
                fromFrame: cue.fromFrame,
                durationInFrames: cue.durationInFrames ?? catalogItem.durationInFrames,
                wavPath: variant
            })
        }
    }

    return placements
}

export function unrollFoleySequencesJsx(placements: FoleyPlacementSpec[]): string {
    const blocks: string[] = []

    for (const p of placements) {
        if (!Number.isInteger(p.fromFrame) || p.fromFrame < 0 ||
            !Number.isInteger(p.durationInFrames) || p.durationInFrames < 0) {
            throw new Error('ERR_FLOAT_FOLEY_FRAME')
        }
        blocks.push(`<Sequence from={${p.fromFrame}} durationInFrames={${p.durationInFrames}}><Audio src={staticFile("${p.wavPath}")} volume={1} /></Sequence>`)
    }

    return blocks.join('\n')
}

export const runResolveFoleyBuzz = (ste: State, bale: FoleyBit, bal: FoleyBit & { slv: Function; blk: Function }) => {
    try {
        const sceneId = bale.dat?.sceneId || 'scene-0'
        const cues = bale.dat?.cues || []
        const placements = resolveFoleyPlacements(sceneId, cues)
        const jsxString = unrollFoleySequencesJsx(placements)

        routeTelemetryToConsole(`[FOLEY] Resolved ${placements.length} placements`)

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: jsxString,
            dat: { placements }
        })
    } catch (err: any) {
        routeTelemetryToConsole(`[FOLEY_ERR] ${err.message}`)
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: err.message,
            dat: { error: err.message }
        })
    }
}
