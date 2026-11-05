import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
    VIEWPORT_GRID_LEFT_AXIS,
    VIEWPORT_GRID_RIGHT_AXIS,
    VIEWPORT_MENU_CHOICES,
    streamChoiceTooltip,
    initViewportMenu,
    renderChoiceSwitchboard,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import {
    sanitizeTo7BitAscii,
    formatTelemetryLine,
    routeTelemetryToConsole,
} from '../99.bus.unit/buz/bus.buzz.js'
import { menuReducer, INITIAL_MENU_STATE } from '../98.menu.unit/menu.reduce.js'
import {
    InitViewportMenu,
    UpdateViewportMenu,
    ExecuteMenuChoice,
    ToggleMenuEndpoint,
} from '../98.menu.unit/menu.action.js'
import {
    CANONICAL_LOCAL_LOOPBACK,
    setRuntimeEndpoint,
    clearRuntimeEndpoint,
} from '../08.edgecontrol.unit/buz/cascade.buzz.js'

describe('Phase 3 Blessed Terminal Cockpit Dispatch Integration', () => {
    beforeEach(() => {
        clearRuntimeEndpoint()
        delete (globalThis as any).agentBaseUrl
    })

    afterEach(() => {
        clearRuntimeEndpoint()
        delete (globalThis as any).agentBaseUrl
    })

    it('Level 0 & Level 2: allocates 12x12 Cartesian grid boundaries for dual-pane layout', () => {
        expect(VIEWPORT_GRID_LEFT_AXIS.x).toBe(0)
        expect(VIEWPORT_GRID_LEFT_AXIS.y).toBe(0)
        expect(VIEWPORT_GRID_LEFT_AXIS.xSpan).toBe(4)
        expect(VIEWPORT_GRID_LEFT_AXIS.ySpan).toBe(12)

        expect(VIEWPORT_GRID_RIGHT_AXIS.x).toBe(4)
        expect(VIEWPORT_GRID_RIGHT_AXIS.y).toBe(0)
        expect(VIEWPORT_GRID_RIGHT_AXIS.xSpan).toBe(8)
        expect(VIEWPORT_GRID_RIGHT_AXIS.ySpan).toBe(12)
    })

    it('Level 1 & Level 2: registers exactly the 5 vertical choices in INITIAL_MENU_STATE', () => {
        expect(INITIAL_MENU_STATE.choices.length).toBe(5)
        const labels = INITIAL_MENU_STATE.choices.map((c) => c.label)
        expect(labels[0]).toBe('COMPILE EPISODE VIA EDGE GATEWAY')
        expect(labels[1]).toBe('TOGGLE TARGET ENDPOINT (LOCAL/LIVE)')
        expect(labels[2]).toBe('INSPECT ACTIVE DISPATCH STATE')
        expect(labels[3]).toBe('FLUSH LOCAL WORKSPACE CACHE')
        expect(labels[4]).toBe('ROOT MENU')
    })

    it('Level 2: streams contextual guidance using token >> [TOOLTIP] without screen redraw', () => {
        const tooltip = streamChoiceTooltip('COMPILE EPISODE VIA EDGE GATEWAY')
        expect(tooltip).toContain('>> [TOOLTIP] [INFO]')
        expect(tooltip).toContain(
            'Dispatches episode compilation to edge gateway with local fallback.',
        )
        expect(/[^\x00-\x7F]/.test(tooltip)).toBe(false)
    })

    it('Level 2: sanitizes multi-byte UTF-8 emojis into pure 7-bit ASCII', () => {
        const input = '>> \u{1F680} Testing [STATUS] \u{1F7E2} OK \u{2705}'
        const clean = sanitizeTo7BitAscii(input)
        expect(clean).toBe('>>  Testing [STATUS]  OK ')
        expect(/^[\x00-\x7F]+$/.test(clean)).toBe(true)
    })

    it('Level 2: formats telemetry lines with tags, sceneId and messages', () => {
        const output = formatTelemetryLine(
            'DISPATCH',
            'ep01_sc03',
            'Payload validated',
        )
        expect(output).toBe('>> [DISPATCH] [ep01_sc03] Payload validated')
        expect(/[^\x00-\x7F]/.test(output)).toBe(false)
    })

    it('Level 2: handles headless CI degradation gracefully without LIBRARY handle', async () => {
        const originalLib = (globalThis as any).LIBRARY
        delete (globalThis as any).LIBRARY
        try {
            await expect(initViewportMenu()).resolves.toBeUndefined()
            await expect(renderChoiceSwitchboard()).resolves.toBeUndefined()
        } finally {
            if (originalLib) {
                ;(globalThis as any).LIBRARY = originalLib
            }
        }
    })

    it('Level 1 & Level 3: reducer preserves immutability and returns frozen models', () => {
        const initial = INITIAL_MENU_STATE
        expect(Object.isFrozen(initial)).toBe(true)

        const updated = menuReducer(
            initial,
            new UpdateViewportMenu({ idx: 'mnu00', val: 2 }),
        )
        expect(Object.isFrozen(updated)).toBe(true)
        expect(updated.activeIndex).toBe(2)
        expect(initial.activeIndex).toBe(0)

        const executed = menuReducer(
            updated,
            new ExecuteMenuChoice({ idx: 'mnu00', val: 1 }),
        )
        expect(Object.isFrozen(executed)).toBe(true)
        expect(executed.lastActionStatus).toBe('EXECUTED')
        expect(executed.lastDispatchedAtMs).toBeGreaterThan(0)
    })

    it('Level 3: alternates runtime endpoint dynamically between local loopback and live edge', () => {
        let state = INITIAL_MENU_STATE
        expect(state.targetEndpoint).toBe(CANONICAL_LOCAL_LOOPBACK)

        state = menuReducer(state, new ToggleMenuEndpoint())
        expect(state.targetEndpoint).toBe('https://viewport-edge.workers.dev')
        expect((globalThis as any).agentBaseUrl).toBe(
            'https://viewport-edge.workers.dev',
        )

        state = menuReducer(state, new ToggleMenuEndpoint())
        expect(state.targetEndpoint).toBe(CANONICAL_LOCAL_LOOPBACK)
        expect((globalThis as any).agentBaseUrl).toBe(CANONICAL_LOCAL_LOOPBACK)
    })

    it('Level 0 & Level 3: runner argument parser recognizes --package=500.viewport and -p', async () => {
        const cliPath = '../../../apps/995.library/cliArgs.js'
        const { parseCliArguments } = await import(/* @vite-ignore */ cliPath)
        const long = parseCliArguments([
            'node',
            'run.ts',
            '--package=500.viewport',
        ])
        expect(long.targetPackage).toBe('500.viewport')

        const short = parseCliArguments([
            'node',
            'run.ts',
            '-p',
            '500.viewport',
        ])
        expect(short.targetPackage).toBe('500.viewport')
    })
})
