import { describe, it, expect, vi } from 'vitest'
import {
    VIEWPORT_MENU_CHOICES,
    streamChoiceTooltip,
    runBakeParallaxDinnerEpisodeJourney
} from '../98.menu.unit/buz/00.menu.buzz.js'
import * as busBuzz from '../99.bus.unit/buz/bus.buzz.js'

describe('Parallax Cockpit Journey', () => {
    it('VIEWPORT_MENU_CHOICES contains BAKE PARALLAX DINNER AUDIO-ONLY EPISODE and streamChoiceTooltip emits pure 7-bit ASCII', () => {
        const choice = VIEWPORT_MENU_CHOICES.find(c => c.label === 'BAKE PARALLAX DINNER AUDIO-ONLY EPISODE');
        expect(choice).toBeDefined();

        const mockRoute = vi.spyOn(busBuzz, 'routeTelemetryToConsole');
        // Let's just mock it to return what it's given, as the original does. Or we can just call streamChoiceTooltip and capture the output.
        // Actually, streamChoiceTooltip calls routeTelemetryToConsole and returns its result.
        mockRoute.mockImplementation((str) => str as string);

        const tooltip = streamChoiceTooltip('BAKE PARALLAX DINNER AUDIO-ONLY EPISODE');

        // Assert pure 7-bit ASCII
        expect(/^[\x00-\x7F]*$/.test(tooltip)).toBe(true);

        mockRoute.mockRestore();
    });

    it('Executing runBakeParallaxDinnerEpisodeJourney streams expected telemetry banners to cns00 with 100% 7-bit ASCII characters', async () => {
        const mockRoute = vi.spyOn(busBuzz, 'routeTelemetryToConsole');

        await runBakeParallaxDinnerEpisodeJourney();

        // 1. Ensure routeTelemetryToConsole was called with pure 7-bit ASCII.
        for (const call of mockRoute.mock.calls) {
            const str = call[0] as string;
            expect(/^[\x00-\x7F]*$/.test(str)).toBe(true);
        }

        // 2. We can check if it output the specific 4 explicit banners we requested in the plan
        const loggedStrings = mockRoute.mock.calls.map(c => c[0] as string);

        expect(loggedStrings).toContain('>> [FOLEY] [ep01_sc01] Resolved 9 deterministic Foley placements (Mulberry32 + :retry1) [OK]');
        expect(loggedStrings).toContain('>> [AMBIENCE] [ep01_sc01] Compiled -14.0 dB quadratic ducking envelope (18f merge) [OK]');
        expect(loggedStrings).toContain('>> [BAKE:AUDIO_ONLY] [Episode_001] Stamped 3-track audio composition (0 visual plates) [OK]');
        expect(loggedStrings).toContain('>> [SEAL] [Episode_001] Verified @lifecycle: generated SHA-256 seal [OK]');

        mockRoute.mockRestore();
    });
});
