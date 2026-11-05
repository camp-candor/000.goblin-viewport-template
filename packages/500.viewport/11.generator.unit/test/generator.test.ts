import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import {
    parseParams,
    stageWorkspace,
    cloneStaticToolchain,
} from '../buz/generator.buzz'

describe('11.generator.unit: Phase 1 Scaffolding Invariants', () => {
    const testOutDir = path.resolve(__dirname, '.tmp_test_epXXX')

    beforeEach(() => {
        if (fs.existsSync(testOutDir)) {
            fs.rmSync(testOutDir, { recursive: true, force: true })
        }
    })

    afterEach(() => {
        if (fs.existsSync(testOutDir)) {
            fs.rmSync(testOutDir, { recursive: true, force: true })
        }
    })

    it('[TASK-VT-1.1] validates and ingests CLI arguments correctly', () => {
        const validArgs = [
            '--manifest',
            './test/manifest.json',
            '--ast',
            './test/ast.json',
            '--series',
            'under-the-floorboards',
            '--out',
            testOutDir,
        ]

        const params = parseParams(validArgs)
        expect(params.manifest).toBe('./test/manifest.json')
        expect(params.ast).toBe('./test/ast.json')
        expect(params.series).toBe('under-the-floorboards')
        expect(params.out).toBe(testOutDir)
    })

    it('[TASK-VT-1.1] throws deterministic error on missing mandatory arguments', () => {
        const invalidArgs = ['--manifest', './test/manifest.json']
        expect(() => parseParams(invalidArgs)).toThrowError(
            /ERR_MISSING_CLI_PARAMS/,
        )
    })

    it('[TASK-VT-1.2] stages target directory tree with matching layout', () => {
        const layout = stageWorkspace(testOutDir)

        expect(fs.existsSync(layout.rootDir)).toBe(true)
        expect(fs.existsSync(layout.componentsDir)).toBe(true)
        expect(fs.existsSync(layout.assetsDir)).toBe(true)
        expect(fs.existsSync(layout.outDir)).toBe(true)
    })

    it('[TASK-VT-1.3] clones remotion.config.ts with locked Swangle headless configuration', () => {
        const layout = stageWorkspace(testOutDir)
        const configs = cloneStaticToolchain(layout.rootDir)

        expect(configs.length).toBeGreaterThan(0)
        const configFile = configs[0]
        expect(fs.existsSync(configFile)).toBe(true)

        const content = fs.readFileSync(configFile, 'utf-8')
        expect(content).toContain("Config.setChromiumOpenGlRenderer('swangle')")
        expect(content).toContain('Config.setConcurrency(1)')
    })
})
