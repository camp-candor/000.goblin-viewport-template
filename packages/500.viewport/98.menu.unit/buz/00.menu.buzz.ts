/* eslint-disable */
import fs from 'fs'
import path from 'path'
import * as ActMnu from '../menu.action.js'
//import * as ActAgt from '../../00.agent.unit/agent.action.js';
import * as ActOlm from '../../00.viewport.unit/viewport.action.js'
import {
    stageWorkspace,
    cloneStaticToolchain,
} from '../../11.generator.unit/buz/generator.buzz.js'
import {
    quantizeShotDuration,
    adaptCausalLattice,
} from '../../22.temporalquantization.unit/buz/temporalquantization.buzz.js'
import {
    bakeStaticComposition,
    projectCoordinatePercentages,
} from '../../20.sourcebaking.unit/buz/sourcebaking.buzz.js'

import type { MenuModel } from '../menu.model.js'
import type MenuBit from '../fce/menu.bit.js'
import type State from '../../99.core/state.js'

import * as Grid from '../../val/grid.js'
import * as Align from '../../val/align.js'
import * as Color from '../../val/console-color.js'

import * as SHAPE from '../../val/shape.js'
import * as FOCUS from '../../val/focus.js'

let bit, lst, dex, idx, dat, src, val
let rootSlv

let SOWER, AGENT, CLICKUP, VIEWPORT

const UPDATE_GRID = '[Grid action] Update Grid'
const WRITE_CONSOLE = '[Write action] Write Console'
const UPDATE_CONSOLE = '[Console action] Update Console'
const OPEN_CHOICE = '[Open action] Open Choice'
const CLOSE_TERMINAL = '[Close action] Close Terminal'
const PRINT_MENU = '[Render action] Print Menu'

const COMPILE_EPISODE_WORKSPACE = 'COMPILE EPISODE WORKSPACE'
const QUANTIZE_TIMELINE = 'QUANTIZE TIMELINE'
const BAKE_STATIC_COMPOSITION = 'BAKE STATIC COMPOSITION'

export const resolveRepoRoot = (): string => {
    let curr = process.cwd()
    while (curr && curr !== path.dirname(curr)) {
        if (
            fs.existsSync(
                path.join(curr, 'packages', '500.viewport', 'package.json'),
            )
        ) {
            return curr
        }
        curr = path.dirname(curr)
    }

    if (typeof __dirname !== 'undefined') {
        let dir = __dirname
        while (dir && dir !== path.dirname(dir)) {
            if (
                fs.existsSync(
                    path.join(dir, 'packages', '500.viewport', 'package.json'),
                )
            ) {
                return dir
            }
            dir = path.dirname(dir)
        }
    }

    return path.resolve(process.cwd())
}

const compileEpisodeWorkspace = async () => {
    const outDir = path.join(resolveRepoRoot(), 'goblin-episodes', 'ep040')

    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [SCAFFOLD] Staging workspace hierarchy...',
    })

    try {
        const layout = stageWorkspace(outDir)
        const cloned = cloneStaticToolchain(layout.rootDir)

        const configContent = fs.readFileSync(cloned[0], 'utf-8')
        if (
            !configContent.includes(
                "Config.setChromiumOpenGlRenderer('swangle')",
            ) ||
            !configContent.includes('Config.setConcurrency(1)')
        ) {
            throw new Error(
                'ERR_TOOLCHAIN_CONFIG_CORRUPT: swangle lock missing.',
            )
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] Toolchain config cloned with --gl=swangle',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] Episode workspace staged successfully',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [PATH] ${layout.rootDir}`,
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [SCAFFOLD] Invariant violation: ${err.message}`,
        })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

const quantizeTimeline = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [QUANT] Analyzing acoustic dialogue stems...',
    })

    try {
        const durationMs = 3120.5
        const frames = quantizeShotDuration(durationMs)

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [QUANT] ${durationMs.toFixed(2)} ms -> ${frames} frames (from=0, to=${frames - 1})`,
        })

        const lattice = adaptCausalLattice(frames)

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [QUANT] Causal Lattice Adapter: Shot expanded to ${lattice.diffusionFrames} frames (n=${lattice.latticeIndex}, trim=${lattice.trimEndFrames}f)`,
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] [QUANT] Acoustic timeline quantized with zero cumulative drift.',
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [QUANT] Invariant violation: ${err.message}`,
        })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

export const bakeStaticCompositionJourney = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [BAKE] Ingesting dialogue shots...',
    })

    try {
        const input = {
            episodeId: '040',
            seriesSlug: 'under-the-floorboards',
            shots: [
                {
                    shotIndex: 1,
                    fromFrame: 0,
                    durationInFrames: 75,
                    speakerId: 'spk_bog',
                    characterName: 'BOG',
                    emotion: 'humiliated',
                    dialogueText: 'They locked the cellar doors.',
                    audioWavPath: 'audio/dialogue/ep040_sh01.wav',
                    anchorPoint: { x: 512, y: 980 },
                    mouthBoundingBox: { x: 380, y: 240, width: 64, height: 32 },
                },
                {
                    shotIndex: 2,
                    fromFrame: 75,
                    durationInFrames: 99,
                    speakerId: 'spk_spleen',
                    characterName: 'SPLEEN',
                    emotion: 'defensive',
                    dialogueText: 'We dig beneath the joists then.',
                    audioWavPath: 'audio/dialogue/ep040_sh02.wav',
                    anchorPoint: { x: 480, y: 960 },
                    mouthBoundingBox: { x: 410, y: 220, width: 58, height: 30 },
                    sidechainDuckingDb: -14,
                },
            ],
        }

        const receipt = bakeStaticComposition(input)

        if (receipt.status !== 'SUCCESS') {
            throw new Error(
                'ERR_BAKE_FAILED: Static composition receipt not SUCCESS.',
            )
        }

        const head = input.shots[0]
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [BAKE] Inlined from={${head.fromFrame}} durationInFrames={${head.durationInFrames}}`,
        })

        const projection = projectCoordinatePercentages(
            head.anchorPoint.x,
            head.anchorPoint.y,
        )
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [BAKE] Projected anchor -> origin: ${projection.originXPercent} ${projection.originYPercent}`,
        })

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [BAKE] Static unrolling complete: 0 dynamic array iterations.',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] [BAKE] Static React composition emitted without dynamic loops.',
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [BAKE] Invariant violation: ${err.message}`,
        })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

export const initMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    if (bal.slv != null) rootSlv = bal.slv

    bit = await global.LIBRARY.hunt(UPDATE_GRID, {
        x: 4,
        y: 0,
        xSpan: 8,
        ySpan: 12,
    })
    bit = await global.LIBRARY.hunt(WRITE_CONSOLE, {
        idx: 'cns00',
        src: '',
        dat: { net: bit.grdBit.dat, src: 'alligaor0' },
    })

    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })
    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: 'VIEWPORT MENU',
    })

    bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '-----------',
    })

    await updateMenu(cpy, bal, ste)

    return cpy
}

export const updateMenu = async (cpy: MenuModel, bal: MenuBit, ste: State) => {
    lst = [
        ActOlm.UPDATE_VIEWPORT.split(']')[1],
        ActOlm.TEST_VIEWPORT.split(']')[1],
        ActOlm.LIST_VIEWPORT.split(']')[1],
        COMPILE_EPISODE_WORKSPACE,
        QUANTIZE_TIMELINE,
        BAKE_STATIC_COMPOSITION,
        'ROOT MENU',
    ]

    bit = await global.LIBRARY.hunt(UPDATE_GRID, {
        x: 0,
        y: 4,
        xSpan: 4,
        ySpan: 8,
    })
    bit = await global.LIBRARY.hunt(OPEN_CHOICE, {
        dat: { clr0: Color.BLACK, clr1: Color.YELLOW },
        src: Align.VERTICAL,
        lst,
        net: bit.grdBit.dat,
    })

    src = bit.chcBit.src

    switch (src) {
        case ActOlm.UPDATE_VIEWPORT.split(']')[1]:
            bit = await ste.hunt(ActOlm.UPDATE_VIEWPORT, {
                content: 'Viewport Menu Selected',
            })
            bit = await global.LIBRARY.hunt(PRINT_MENU, bit)
            break

        case ActOlm.TEST_VIEWPORT.split(']')[1]:
            bit = await ste.hunt(ActOlm.TEST_VIEWPORT, {
                content: 'Viewport Menu Selected',
            })
            bit = await global.LIBRARY.hunt(PRINT_MENU, bit)
            break

        case ActOlm.LIST_VIEWPORT.split(']')[1]:
            bit = await ste.hunt(ActOlm.LIST_VIEWPORT, {})
            lst = bit.olmBit.lst

            if (lst.length === 0) {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: 'No Viewport Models Found',
                })
            } else {
                bit = await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                    idx: 'cns00',
                    src: 'Listing Viewport Models...',
                })
                lst.forEach((a: string) =>
                    global.LIBRARY.hunt(UPDATE_CONSOLE, {
                        idx: 'cns00',
                        src: a,
                    }),
                )
            }

            await new Promise((resolve) => setTimeout(resolve, 3000))
            break

        case COMPILE_EPISODE_WORKSPACE:
            await compileEpisodeWorkspace()
            break

        case QUANTIZE_TIMELINE:
            await quantizeTimeline()
            break

        case BAKE_STATIC_COMPOSITION:
            await bakeStaticCompositionJourney()
            break

        case 'ROOT MENU':
            if (rootSlv != null) rootSlv({ mnuBit: { idx: 'root-menu' } })
            return cpy

        default:
            bit = await ste.hunt(CLOSE_TERMINAL, {})
            break
    }

    setTimeout(async () => {
        bit = await ste.hunt(ActMnu.UPDATE_MENU, {})
    }, 333)

    return cpy
}

const patch = (ste, type, bale) => ste.dispatch({ type, bale })
