import { describe, it, expect, vi } from 'vitest'
import {
    VIEWPORT_MENU_CHOICES,
    streamChoiceTooltip,
    runBakeParallaxDinnerEpisodeJourney,
} from '../98.menu.unit/buz/00.menu.buzz.js'

// We will use standard mock on the file containing routeTelemetryToConsole
vi.mock('../99.bus.unit/buz/bus.buzz.js', async (importOriginal) => {
    const mod =
        await importOriginal<typeof import('../99.bus.unit/buz/bus.buzz.js')>()
    return {
        ...mod,
        routeTelemetryToConsole: vi.fn((a) => String(a)),
    }
})
import * as bus from '../99.bus.unit/buz/bus.buzz.js'

describe('Parallax Cockpit Journey', () => {
    it('has BAKE PARALLAX DINNER choice and 7-bit ASCII tooltip', () => {
        const choice = VIEWPORT_MENU_CHOICES.find(
            (c) => c.label === 'BAKE PARALLAX DINNER AUDIO-ONLY EPISODE',
        )
        expect(choice).toBeDefined()

        const tooltip = streamChoiceTooltip(
            'BAKE PARALLAX DINNER AUDIO-ONLY EPISODE',
        )
        expect(/^[\x00-\x7F]*$/.test(tooltip)).toBe(true)
    })

    it('streams 4 pure 7-bit ASCII telemetry lines during journey', async () => {
        const spy = vi.mocked(bus.routeTelemetryToConsole)
        spy.mockClear()
        await runBakeParallaxDinnerEpisodeJourney()

        const calls = spy.mock.calls.map((c) => c[0])
        const hasFoley = calls.some((c) => String(c).includes('>> [FOLEY]'))
        const hasAmbience = calls.some((c) =>
            String(c).includes('>> [AMBIENCE]'),
        )
        const hasBake = calls.some((c) =>
            String(c).includes('>> [BAKE:AUDIO_ONLY]'),
        )
        const hasSeal = calls.some((c) => String(c).includes('>> [SEAL]'))

        expect(hasFoley).toBe(true)
        expect(hasAmbience).toBe(true)
        expect(hasBake).toBe(true)
        expect(hasSeal).toBe(true)

        calls.forEach((call) => {
            expect(/^[\x00-\x7F]*$/.test(String(call))).toBe(true)
        })
    })
})
