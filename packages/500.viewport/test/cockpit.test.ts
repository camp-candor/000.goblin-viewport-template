import { describe, it, expect } from 'vitest'
import {
    VIEWPORT_MENU_CHOICES,
    VIEWPORT_GRID_LEFT_AXIS,
    VIEWPORT_GRID_RIGHT_AXIS,
    streamChoiceTooltip,
} from '../98.menu.unit/buz/00.menu.buzz.js'
import {
    sanitizeTo7BitAscii,
    formatTelemetryLine,
    routeTelemetryToConsole,
} from '../99.bus.unit/buz/bus.buzz.js'
import { parseCliArguments } from '../../../apps/995.library/cliArgs.js'
import { runEdgeDispatchGatewayJourney } from '../08.edgecontrol.unit/buz/edgecontrol.buzz.js'
import { compileMasterEpisode } from '../00.viewport.unit/buz/viewport.buzz.js'
import { reducer as menuDispatchEntry } from '../98.menu.unit/menu.reduce.js'
import { MenuModel } from '../98.menu.unit/menu.model.js'

describe('98.menu.unit & 99.bus.unit: Blessed Terminal Cockpit Integration', () => {
    it('[TASK-VT-10.1] allocates 12x12 Cartesian grid boundaries for dual-pane layout', () => {
        expect(VIEWPORT_GRID_LEFT_AXIS.x).toBe(0)
        expect(VIEWPORT_GRID_LEFT_AXIS.y).toBe(0)
        expect(VIEWPORT_GRID_LEFT_AXIS.xSpan).toBe(4)
        expect(VIEWPORT_GRID_LEFT_AXIS.ySpan).toBe(12)

        expect(VIEWPORT_GRID_RIGHT_AXIS.x).toBe(4)
        expect(VIEWPORT_GRID_RIGHT_AXIS.y).toBe(0)
        expect(VIEWPORT_GRID_RIGHT_AXIS.xSpan).toBe(8)
        expect(VIEWPORT_GRID_RIGHT_AXIS.ySpan).toBe(12)
    })

    it('[TASK-VT-10.1] registers all required viewport lifecycle choices in the switchboard', () => {
        expect(VIEWPORT_MENU_CHOICES.length).toBe(5)

        const labels = VIEWPORT_MENU_CHOICES.map((c) => c.label)
        expect(labels).toContain('COMPILE EPISODE VIA EDGE GATEWAY')
        expect(labels).toContain('TOGGLE TARGET ENDPOINT (LOCAL/LIVE)')
        expect(labels).toContain('INSPECT ACTIVE DISPATCH STATE')
        expect(labels).toContain('FLUSH LOCAL WORKSPACE CACHE')
        expect(labels).toContain('ROOT MENU')
    })

    it('[TASK-VT-10.2] streams contextual descriptions on choice focus without crashing', () => {
        const tooltip = streamChoiceTooltip('COMPILE EPISODE VIA EDGE GATEWAY')
        expect(tooltip).toContain('>> [TOOLTIP] [INFO]')
        expect(tooltip).toContain(
            'Dispatches episode compilation to edge gateway',
        )
    })

    it('[TASK-VT-10.3] sanitizes multi-byte Unicode emojis down to pure 7-bit ASCII', () => {
        const dirtyMessage =
            'Compilation finished successfully!  Visuals locked. '
        const cleanMessage = sanitizeTo7BitAscii(dirtyMessage)

        const nonAsciiRegex = /[^\x00-\x7F]/
        expect(nonAsciiRegex.test(cleanMessage)).toBe(false)
        expect(cleanMessage).toBe(
            'Compilation finished successfully!  Visuals locked. ',
        )
    })

    it('[TASK-VT-10.3] formats telemetry log lines conforming to [OK] and [FAIL] tokens', () => {
        const successLine = formatTelemetryLine({
            topic: 'VIEWPORT',
            level: 'INFO',
            message: 'Episode 040 compiled.',
        })
        expect(successLine).toBe('>> [OK] [VIEWPORT] Episode 040 compiled.')

        const errorLine = formatTelemetryLine({
            topic: 'VIEWPORT',
            level: 'ERROR',
            message: 'Zero-byte asset poison detected.',
        })
        expect(errorLine).toBe(
            '>> [FAIL] [VIEWPORT] Zero-byte asset poison detected.',
        )
    })

    it('[TASK-VT-10.4] runner parser correctly extracts --package=500.viewport CLI options', () => {
        const parsedLong = parseCliArguments([
            'node',
            'run.ts',
            '--package=500.viewport',
        ])
        expect(parsedLong.targetPackage).toBe('500.viewport')

        const parsedShort = parseCliArguments([
            'node',
            'run.ts',
            '-p',
            '500.viewport',
        ])
        expect(parsedShort.targetPackage).toBe('500.viewport')
    })

    it('[TASK-VT-10.5] viewport compile handler seals the master episode with zero runtime drift', () => {
        const lines: string[] = []
        const libBackup = (globalThis as any).LIBRARY
        ;(globalThis as any).LIBRARY = {
            hunt: async (_action: string, bale: any) => {
                if (typeof bale?.src === 'string') lines.push(bale.src)
                return {}
            },
        }
        try {
            let resolved: any = null
            compileMasterEpisode(
                {} as any,
                {
                    idx: 'viewport-cockpit',
                    slv: (v: any) => {
                        resolved = v
                    },
                } as any,
                {} as any,
            )
            expect(lines).toContain(
                '>> [OK] [VIEWPORT] Episode 040 compiled with zero runtime drift.',
            )
            expect(resolved?.vptBit?.idx).toBe('compile-master-episode')
        } finally {
            ;(globalThis as any).LIBRARY = libBackup
        }
    })

    it('[TASK-VT-1.4] edge dispatch gateway journey streams ingest, receipt, and status telemetry', async () => {
        const lines: string[] = []
        const libBackup = (globalThis as any).LIBRARY
        ;(globalThis as any).LIBRARY = {
            hunt: async (_action: string, bale: any) => {
                if (typeof bale?.src === 'string') lines.push(bale.src)
                return {}
            },
        }
        try {
            await runEdgeDispatchGatewayJourney({})
            expect(lines).toHaveLength(3)
            expect(lines[0]).toBe(
                '>> [EDGE:INGEST] [ep01_sc03] Intent validated',
            )
            expect(lines[1]).toMatch(
                /^>> \[EDGE:RECEIPT\] \[ep01_sc03\] Hash generated: [0-9a-f]{64} \[OK\]$/,
            )
            expect(lines[2]).toBe(
                '>> [EDGE:STATUS] [ep01_sc03] Status: QUEUED (seq: 1)',
            )
            for (const line of lines) {
                expect(/[^\x00-\x7F]/.test(line)).toBe(false)
            }
        } finally {
            ;(globalThis as any).LIBRARY = libBackup
        }

        const headlessBackup = (globalThis as any).LIBRARY
        delete (globalThis as any).LIBRARY
        try {
            await expect(runEdgeDispatchGatewayJourney({})).resolves.toBe(
                undefined,
            )
        } finally {
            ;(globalThis as any).LIBRARY = headlessBackup
        }
    })

    it('[TASK-VT-10.5] menu dispatch wires INIT_MENU to the cockpit buzz without crashing headless', () => {
        const libBackup = (globalThis as any).LIBRARY
        delete (globalThis as any).LIBRARY
        try {
            const next = menuDispatchEntry(new MenuModel(), {
                type: 'menu:init',
                bale: { idx: 'mnu00', val: 1 },
            } as any)
            expect(next.lastActionStatus).toBe('INITIALIZED')
        } finally {
            ;(globalThis as any).LIBRARY = libBackup
        }
    })
})
