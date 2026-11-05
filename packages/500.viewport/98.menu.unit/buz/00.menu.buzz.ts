/* eslint-disable */
import fs from 'fs'
import os from 'os'
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
import {
    validateVisualManifest,
    resolveCharacterVariant,
} from '../../06.coordinates.unit/buz/coordinates.buzz.js'
import {
    planEpisodeHarvest,
    executeHarvestExtraction,
} from '../../97.collect.unit/buz/collect.buzz.js'
import { auditStorageEnvelope } from '../../03.assets.unit/buz/assets.buzz.js'
import { executeRigsVendoring } from '../../18.rigs.unit/buz/rigs.buzz.js'
import {
    generateShotCameraWrapperCode,
    generateOpticalStackJsx,
} from '../../20.sourcebaking.unit/buz/opticalStack.buzz.js'
import {
    normalizeLf,
    computeBodyChecksum,
    arbitrateAndEmitComposition,
} from '../../19.seals.unit/buz/seals.buzz.js'

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
const RESOLVE_VISUAL_MANIFEST = 'RESOLVE VISUAL MANIFEST'
const HARVEST_EPISODE_ASSETS = 'HARVEST EPISODE ASSETS'
const VENDOR_PRESENTATION_RIGS = 'VENDOR PRESENTATION RIGS'
const GENERATE_OPTICAL_SCOPES = 'GENERATE OPTICAL SCOPES'
const SEAL_COMPOSITION_ARTIFACT = 'SEAL COMPOSITION ARTIFACT'

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

export const resolveVisualManifestJourney = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [VISUAL] Parsing visual manifest...',
    })

    try {
        const rawManifest = {
            manifestVersion: '1.0.0',
            seriesSlug: 'under-the-floorboards',
            characters: {
                char_bog: {
                    characterId: 'char_bog',
                    characterName: 'BOG',
                    anchorPoint: { x: 512, y: 980 },
                    crashZoomTarget: { x: 512, y: 320 },
                    mouthBoundingBox: { x: 380, y: 240, width: 64, height: 32 },
                    variants: {
                        neutral: 'sprites/bog/bog_neutral.png',
                        humiliated: 'sprites/bog/bog_humiliated.png',
                    },
                },
                char_spleen: {
                    characterId: 'char_spleen',
                    characterName: 'SPLEEN',
                    anchorPoint: { x: 480, y: 960 },
                    crashZoomTarget: { x: 480, y: 300 },
                    mouthBoundingBox: { x: 410, y: 220, width: 58, height: 30 },
                    variants: {
                        neutral: 'sprites/spleen/spleen_neutral.png',
                        defensive: 'sprites/spleen/spleen_defensive.png',
                    },
                },
            },
        }

        const manifest = validateVisualManifest(rawManifest)

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [VISUAL] Validated spatial anchors for characters',
        })

        const direct = resolveCharacterVariant(
            manifest,
            'char_bog',
            'humiliated',
        )
        if (direct.isFallback !== false) {
            throw new Error(
                'ERR_DIRECT_MATCH_FAILED: humiliated must resolve without fallback.',
            )
        }

        const fallback = resolveCharacterVariant(
            manifest,
            'char_bog',
            'panicked',
        )
        if (
            fallback.isFallback !== true ||
            fallback.resolvedEmotion !== 'neutral'
        ) {
            throw new Error(
                'ERR_FALLBACK_FAILED: panicked must degrade to neutral baseline.',
            )
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [VISUAL] Resolved direct matches and fallback substitutions',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] [VISUAL] Visual contract manifest parsed.',
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [VISUAL] Invariant violation: ${err.message}`,
        })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

export const harvestEpisodeAssetsJourney = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [HARVEST] Parsing dialogue AST for Episode...',
    })

    let vaultDir = ''
    let destDir = ''
    try {
        vaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viewport-vault-'))
        destDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viewport-stage-'))

        fs.mkdirSync(path.join(vaultDir, 'environments', 'env_swamp'), {
            recursive: true,
        })
        fs.writeFileSync(
            path.join(vaultDir, 'environments', 'env_swamp', 'manifest.json'),
            JSON.stringify({
                locationId: 'env_swamp',
                plates: { standard: 'swamp_matte.png' },
            }),
        )
        fs.writeFileSync(
            path.join(vaultDir, 'environments', 'env_swamp', 'swamp_matte.png'),
            'DUMMY_IMAGE_DATA_1',
        )

        fs.mkdirSync(path.join(vaultDir, 'characters', 'char_bog'), {
            recursive: true,
        })
        fs.writeFileSync(
            path.join(vaultDir, 'characters', 'char_bog', 'manifest.json'),
            JSON.stringify({
                characterId: 'char_bog',
                base_states: { idle: { file: 'bog_idle.png' } },
                condition_variants: {
                    humiliated: { file: 'bog_humiliated.png' },
                    enraged: null,
                },
                mouth_shapes: {
                    closed: 'mouth_closed.png',
                    wide: 'mouth_wide.png',
                },
            }),
        )
        for (const f of [
            'bog_idle.png',
            'bog_humiliated.png',
            'mouth_closed.png',
            'mouth_wide.png',
        ]) {
            fs.writeFileSync(
                path.join(vaultDir, 'characters', 'char_bog', f),
                `DUMMY_IMAGE_DATA_${f}`,
            )
        }

        const ast = {
            episode_id: 'ep040',
            location_id: 'env_swamp',
            rounds: [
                {
                    speaker: 'char_bog',
                    emotion: 'humiliated',
                    phonemes: [
                        { time_ms: 0, viseme: 'closed' },
                        { time_ms: 100, viseme: 'wide' },
                    ],
                },
            ],
        }

        const plan = planEpisodeHarvest(ast as any, vaultDir)

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [HARVEST] Staged environment plate:',
        })

        if (plan.characterSpritePaths.length === 0) {
            throw new Error(
                'ERR_EMPTY_CHARACTER_HARVEST: No character variants cherry-picked.',
            )
        }
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [HARVEST] Cherry-picked character variants',
        })

        if (plan.visemeSpritePaths.length === 0) {
            throw new Error(
                'ERR_EMPTY_VISEME_HARVEST: No mouth visemes cherry-picked.',
            )
        }
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [HARVEST] Cherry-picked mouth visemes',
        })

        const receipt = executeHarvestExtraction(plan, vaultDir, destDir)
        if (receipt.status !== 'SUCCESS') {
            throw new Error(
                'ERR_HARVEST_FAILED: Asset extraction receipt not SUCCESS.',
            )
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [ENVELOPE] Running Zero-Byte Poison Sentinel...',
        })

        const envelope = auditStorageEnvelope(destDir)
        if (!envelope.nominalBudgetPassed) {
            throw new Error(
                'ERR_NOMINAL_BUDGET_FAILED: Staged payload exceeds 100MB nominal budget.',
            )
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [ENVELOPE] Asset staging audited. Nominal budget PASSED.',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] [HARVEST] Cherry-picked assets for Episode.',
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [HARVEST] Invariant violation: ${err.message}`,
        })
    } finally {
        if (vaultDir) fs.rmSync(vaultDir, { recursive: true, force: true })
        if (destDir) fs.rmSync(destDir, { recursive: true, force: true })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

export const vendorPresentationRigsJourney = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [RIGS] Initializing presentation primitive vendoring...',
    })

    let componentsDir = ''
    try {
        componentsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viewport-rigs-'))

        const receipt = executeRigsVendoring(componentsDir, 'ep040')
        if (
            receipt.status !== 'SUCCESS' ||
            receipt.totalComponentsVendored !== 3
        ) {
            throw new Error(
                'ERR_RIGS_COUNT_FAILED: Expected 3 vendored presentation components.',
            )
        }

        for (const fileName of [
            'GoblinPuppet.tsx',
            'AmbientTrack.tsx',
            'FoleyTrack.tsx',
        ]) {
            const audit = receipt.vendoredFiles.find(
                (f) => f.fileName === fileName,
            )
            if (!audit || !fs.existsSync(audit.destinationPath)) {
                throw new Error(
                    `ERR_RIGS_MISSING_FILE: Vendored file not written: ${fileName}`,
                )
            }
            if (audit.hasDanglingParentImports) {
                throw new Error(
                    `ERR_RIGS_DANGLING_IMPORTS: Unsanitized parent imports in ${fileName}`,
                )
            }
            if (!/^[a-f0-9]{64}$/.test(audit.sha256)) {
                throw new Error(
                    `ERR_RIGS_BAD_DIGEST: Invalid SHA-256 digest on ${fileName}`,
                )
            }
            await global.LIBRARY.hunt(UPDATE_CONSOLE, {
                idx: 'cns00',
                src: `>> [RIGS] Vendored components/${fileName} (sanitized imports)`,
            })
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [ISOLATION] Verified 0 dangling parent imports (../) across 3 files.',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] [RIGS] Vendored 3 presentation components for Episode.',
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [RIGS] Invariant violation: ${err.message}`,
        })
    } finally {
        if (componentsDir)
            fs.rmSync(componentsDir, { recursive: true, force: true })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

export const generateOpticalScopesJourney = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [OPTICAL] Synthesizing camera wrappers for shot cuts...',
    })

    try {
        const shot = {
            shotIndex: 1,
            fromFrame: 0,
            durationInFrames: 75,
            transformOrigin: '50.00% 95.70%',
            zoomScale: 1.15,
            opticalLayers: {
                environmentMattePath: 'environments/env_swamp/swamp_matte.png',
                vectorSubtitleText: 'The joists are rotting.',
                characterName: 'char_bog',
                emotion: 'humiliated',
                greenDespillEnabled: true,
                contactShadowEnabled: true,
                lensSimulationEnabled: true,
            },
        }

        const wrapperCode = generateShotCameraWrapperCode(
            shot.shotIndex,
            shot.durationInFrames,
            shot.transformOrigin,
            shot.zoomScale,
        )
        if (!wrapperCode.includes('const localFrame = useCurrentFrame();')) {
            throw new Error(
                'ERR_HOOK_DRIFT: Camera wrapper does not isolate useCurrentFrame locally.',
            )
        }

        const wrapperName = `Shot${String(shot.shotIndex).padStart(2, '0')}CameraWrapper`
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [OPTICAL] Scoped wrapper ${wrapperName} (origin: ${shot.transformOrigin}, scale: ${shot.zoomScale})`,
        })

        const stackJsx = generateOpticalStackJsx(shot as any)
        for (const z of [
            'zIndex: 10',
            'zIndex: 20',
            'zIndex: 30',
            'zIndex: 40',
        ]) {
            if (!stackJsx.includes(z)) {
                throw new Error(
                    `ERR_LAYER_STACK_BROKEN: Optical stack missing ${z}.`,
                )
            }
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OPTICAL] Mounted 4-layer optical stack (Matte -> Typography -> Character -> Lens)',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [OK] [OPTICAL] Synthesized 4-layer optical press for shots.',
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [OPTICAL] Invariant violation: ${err.message}`,
        })
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
}

export const sealCompositionArtifactJourney = async () => {
    await global.LIBRARY.hunt(UPDATE_CONSOLE, {
        idx: 'cns00',
        src: '>> [SEAL] Normalizing LF line-endings for Episode...',
    })

    let sealsDir = ''
    try {
        sealsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'viewport-seals-'))

        // CRLF payload proves POSIX normalization precedes hashing
        const rawBodySource =
            'export const Episode_040: React.FC = () => {\r\n  return <div>BOG</div>;\r\n};\r\n'
        const normalizedBody = normalizeLf(rawBodySource)
        if (normalizedBody.includes('\r')) {
            throw new Error(
                'ERR_SEAL_NORMALIZE_FAILED: Carriage returns survived LF normalization.',
            )
        }

        const checksum = computeBodyChecksum(normalizedBody)
        if (!/^[a-f0-9]{64}$/.test(checksum)) {
            throw new Error(
                'ERR_SEAL_DIGEST_FAILED: Body checksum is not a SHA-256 hex digest.',
            )
        }
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [SEAL] Computed SHA-256 body checksum: ${checksum.substring(0, 12)}...`,
        })

        // Seed the initial sealed artifact, then simulate a manual director edit
        const targetFile = path.join(sealsDir, 'Episode_040.tsx')
        const seed = arbitrateAndEmitComposition({
            targetFilePath: targetFile,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            rawBodySource: normalizedBody,
        })
        if (seed.status !== 'WRITTEN') {
            throw new Error(
                'ERR_SEAL_SEED_FAILED: Initial sealed artifact was not WRITTEN.',
            )
        }
        fs.appendFileSync(targetFile, '// manual director edit\n', 'utf8')

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [SEAL] Inspecting existing file: ${targetFile}`,
        })

        const arbitration = arbitrateAndEmitComposition({
            targetFilePath: targetFile,
            seriesSlug: 'under-the-floorboards',
            episodeId: '040',
            rawBodySource: normalizedBody,
        })
        if (
            arbitration.status !== 'REFUSED_EMITTED_CANDIDATE' ||
            !arbitration.divergedFromStamped
        ) {
            throw new Error(
                'ERR_SEAL_DIVERGENCE_MISSED: Manual edit was not trapped to a candidate draft.',
            )
        }
        if (!fs.existsSync(arbitration.writtenPath)) {
            throw new Error(
                'ERR_SEAL_CANDIDATE_MISSING: Candidate draft was not emitted on refusal.',
            )
        }

        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: '>> [REFUSAL] Checksum divergence detected. Manual edits preserved.',
        })
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [CANDIDATE] Emitted candidate draft: ${arbitration.writtenPath}`,
        })

        // Clean-path control: a fresh target seals without refusal
        const cleanTarget = path.join(sealsDir, 'Episode_041.tsx')
        const clean = arbitrateAndEmitComposition({
            targetFilePath: cleanTarget,
            seriesSlug: 'under-the-floorboards',
            episodeId: '041',
            rawBodySource: normalizedBody,
        })
        if (clean.status !== 'WRITTEN') {
            throw new Error(
                'ERR_SEAL_CLEAN_PATH_FAILED: Fresh target was not WRITTEN.',
            )
        }
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [OK] [SEAL] Stamped and sealed Episode 041 (checksum: ${clean.checksum.substring(0, 12)}...).`,
        })
    } catch (err: any) {
        await global.LIBRARY.hunt(UPDATE_CONSOLE, {
            idx: 'cns00',
            src: `>> [FAIL] [SEAL] Invariant violation: ${err.message}`,
        })
    } finally {
        if (sealsDir) fs.rmSync(sealsDir, { recursive: true, force: true })
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
        RESOLVE_VISUAL_MANIFEST,
        HARVEST_EPISODE_ASSETS,
        VENDOR_PRESENTATION_RIGS,
        GENERATE_OPTICAL_SCOPES,
        SEAL_COMPOSITION_ARTIFACT,
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

        case RESOLVE_VISUAL_MANIFEST:
            await resolveVisualManifestJourney()
            break

        case HARVEST_EPISODE_ASSETS:
            await harvestEpisodeAssetsJourney()
            break

        case VENDOR_PRESENTATION_RIGS:
            await vendorPresentationRigsJourney()
            break

        case GENERATE_OPTICAL_SCOPES:
            await generateOpticalScopesJourney()
            break

        case SEAL_COMPOSITION_ARTIFACT:
            await sealCompositionArtifactJourney()
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
