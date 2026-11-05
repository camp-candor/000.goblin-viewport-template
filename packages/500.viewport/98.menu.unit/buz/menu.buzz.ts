import { MenuBit } from '../fce/menu.bit'
import { MenuChoiceItem, GridCoordinates } from '../fce/menu.interface'
import { routeTelemetryToConsole } from '../../99.bus.unit/buz/bus.buzz'
import * as Align from '../../val/align'
import * as Color from '../../val/console-color'

let activeChoiceNet: any = undefined

export const VIEWPORT_GRID_LEFT_AXIS: GridCoordinates = {
    x: 0,
    y: 0,
    xSpan: 4,
    ySpan: 12,
}

export const VIEWPORT_GRID_RIGHT_AXIS: GridCoordinates = {
    x: 4,
    y: 0,
    xSpan: 8,
    ySpan: 12,
}

export const VIEWPORT_MENU_CHOICES: MenuChoiceItem[] = [
    {
        choice: 0,
        label: 'COMPILE MASTER EPISODE WORKSPACE',
        actionType: 'viewport:compile_master_episode',
        description:
            'Execute end-to-end 9-phase static code compilation and asset staging.',
    },
    {
        choice: 1,
        label: 'QUANTIZE ACOUSTIC TIMELINE',
        actionType: '[Temporalquantization action] Accumulate Timeline',
        description:
            'Lock audio duration to discrete 24fps frames and 4n+1 diffusion lattice.',
    },
    {
        choice: 2,
        label: 'BAKE STATIC COMPOSITION',
        actionType: 'sourcebaking:bake_static_composition',
        description:
            'Unroll dialogue arrays and inline unquoted integer frame numbers.',
    },
    {
        choice: 3,
        label: 'RESOLVE VISUAL MANIFEST',
        actionType: 'coordinates:parse_visual_manifest',
        description:
            'Ingest visual asset contracts and route un-illustrated variants to neutral.',
    },
    {
        choice: 4,
        label: 'HARVEST EPISODE ASSETS',
        actionType: 'collect:harvest_episode_assets',
        description:
            'Cherry-pick referenced sprites and enforce sub-100MB storage envelope.',
    },
    {
        choice: 5,
        label: 'VENDOR PRESENTATION RIGS',
        actionType: 'rigs:vendor_presentation_rigs',
        description:
            'Clone GoblinPuppet and audio rigs into episode components directory.',
    },
    {
        choice: 6,
        label: 'GENERATE OPTICAL SCOPES',
        actionType: 'optical:generate_optical_scopes',
        description:
            'Synthesize sequence-relative camera wrappers and 4-layer optical stack.',
    },
    {
        choice: 7,
        label: 'SEAL COMPOSITION ARTIFACT',
        actionType: 'seals:emit_sealed_composition',
        description:
            'Compute body SHA-256 and arbitrate clobber collisions via candidate drafts.',
    },
    {
        choice: 8,
        label: 'MINT PROVENANCE LOCKFILE',
        actionType: 'manifest:mint_provenance_lockfile',
        description:
            'Record 40-char repository Git SHAs, toolchain fingerprint, and set read-only.',
    },
    {
        choice: 9,
        label: 'ROOT MENU',
        actionType: 'library:root_menu',
        description: 'Return to the central studio library switchboard.',
    },
]

/**
 * [TASK-VT-10.2] Focus Callback Tooltip Streamer.
 * Intercepts keyboard navigation focus and streams operational guidance to cns00.
 */
export const streamChoiceTooltip = (choiceLabel: string): string => {
    const match = VIEWPORT_MENU_CHOICES.find((c) => c.label === choiceLabel)
    const text = match
        ? match.description
        : 'Select a viewport operation to execute.'
    return routeTelemetryToConsole({
        topic: 'VIEWPORT',
        level: 'INFO',
        message: text,
    })
}

/**
 * [TASK-VT-10.1] Initializes and mounts the viewport cockpit layout in the Blessed curses screen.
 * Returns the left-axis net mesh so the choice switchboard anchors to the
 * control pane instead of blowing out to fullscreen width.
 */
export const initViewportMenu = async (ste: any): Promise<any> => {
    const lib = (globalThis as any).LIBRARY
    if (!lib || typeof lib.hunt !== 'function') {
        // Headless execution fallback
        return undefined
    }

    // Mount right-hand telemetry pane and bind the cns00 console widget
    const rightBit = await lib.hunt('[Grid action] Update Grid', {
        x: VIEWPORT_GRID_RIGHT_AXIS.x,
        y: VIEWPORT_GRID_RIGHT_AXIS.y,
        xSpan: VIEWPORT_GRID_RIGHT_AXIS.xSpan,
        ySpan: VIEWPORT_GRID_RIGHT_AXIS.ySpan,
    })
    await lib.hunt('[Write action] Write Console', {
        idx: 'cns00',
        src: '',
        dat: { net: rightBit?.grdBit?.dat, src: 'viewport0' },
    })

    for (const banner of ['-----------', 'VIEWPORT MENU', '-----------']) {
        await lib.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: banner,
        })
    }

    // Allocate left-hand control axis for the choice switchboard
    const leftBit = await lib.hunt('[Grid action] Update Grid', {
        x: VIEWPORT_GRID_LEFT_AXIS.x,
        y: VIEWPORT_GRID_LEFT_AXIS.y,
        xSpan: VIEWPORT_GRID_LEFT_AXIS.xSpan,
        ySpan: VIEWPORT_GRID_LEFT_AXIS.ySpan,
    })
    activeChoiceNet = leftBit?.grdBit?.dat
    return activeChoiceNet
}

/**
 * Renders the interactive choice switchboard and binds event handlers.
 * The harness resolves { chcBit: { src: <label> } }; an empty src signals
 * Escape-cancel and re-renders without dispatching.
 */
export const renderChoiceSwitchboard = async (
    ste: any,
    opts?: { net?: any; onRootMenu?: () => void },
): Promise<void> => {
    const lib = (globalThis as any).LIBRARY
    if (!lib || typeof lib.hunt !== 'function') {
        return
    }

    const choices = VIEWPORT_MENU_CHOICES.map((c) => c.label)

    const res = await lib.hunt('[Open action] Open Choice', {
        dat: {
            clr0: Color.BLACK,
            clr1: Color.YELLOW,
            cb: (focusedLabel: string) => {
                streamChoiceTooltip(focusedLabel)
            },
        },
        src: Align.VERTICAL,
        lst: choices,
        net: opts?.net ?? activeChoiceNet,
    })

    const label: string = res?.chcBit?.src || ''
    const selectedItem = VIEWPORT_MENU_CHOICES.find((c) => c.label === label)
    if (!selectedItem) {
        // Cancelled via Escape: re-render without dispatching
        setTimeout(() => {
            renderChoiceSwitchboard(ste, opts)
        }, 333)
        return
    }

    routeTelemetryToConsole({
        topic: 'MENU',
        level: 'INFO',
        message: `Dispatched choice: ${selectedItem.label}`,
    })

    if (selectedItem.label === 'ROOT MENU') {
        opts?.onRootMenu?.()
        return
    }

    // Dispatch selected unit action
    await ste.hunt(selectedItem.actionType, {
        idx: 'viewport-cockpit',
        val: 1,
    })

    // Non-recursive re-entrant tick loop (setTimeout 333ms)
    setTimeout(() => {
        renderChoiceSwitchboard(ste, opts)
    }, 333)
}

export const runInitMenuBuzz = (
    ste: any,
    bale: MenuBit,
    bal: { slv: Function; blk: Function },
): void => {
    initViewportMenu(ste)
        .then((net) => {
            routeTelemetryToConsole({
                topic: 'MENU',
                level: 'INFO',
                message: 'Viewport cockpit menu initialized in 12x12 grid.',
            })
            // Own the screen until ROOT MENU resolves the runner promise
            renderChoiceSwitchboard(ste, {
                net,
                onRootMenu: () => {
                    bal.slv({
                        idx: bale.idx,
                        val: 1,
                        src: '>> [OK] [MENU] Returned to root menu.',
                    })
                },
            })
        })
        .catch((err) => {
            bal.slv({
                idx: bale.idx,
                val: 0,
                src: `>> [FAIL] [MENU] Cockpit init error: ${err.message}`,
            })
        })
}

export const runUpdateMenuBuzz = (
    ste: any,
    bale: MenuBit,
    bal: { slv: Function; blk: Function },
): void => {
    renderChoiceSwitchboard(ste)
        .then(() => {
            bal.slv({
                idx: bale.idx,
                val: 1,
                src: '>> [OK] [MENU] Choice switchboard mounted.',
            })
        })
        .catch((err) => {
            bal.slv({
                idx: bale.idx,
                val: 0,
                src: `>> [FAIL] [MENU] Choice switchboard error: ${err.message}`,
            })
        })
}
