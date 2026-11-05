/**
 * apps/worker/test/unit/tools.custom.test.ts
 * Vitest verification suite for TypeBox structural firewall and sanitizer.
 */

import { describe, it, expect } from 'vitest'
import {
    CompileEpisodeSchema,
    compileEpisodeTool,
    customTools,
} from '../../src/tools.custom.js'
import { sanitizePath, sanitizeSlug } from '../../src/lib/sanitizer.js'
import { Value } from '@sinclair/typebox/value'

describe('Phase 4 Cloudflare Worker TypeBox Contract Boundary', () => {
    const validPayload = {
        seriesSlug: 'under-the-floorboards',
        sceneId: 'ep01_sc03',
        manifestPath: '/data/manifests/ep01_sc03.json',
        astPath: '/data/ast/ep01_sc03.ast.json',
        targetFrameBudget: 72,
    }

    it('validates compliant payloads with Value.Check without eval', () => {
        expect(Value.Check(CompileEpisodeSchema, validPayload)).toBe(true)
    })

    it('rejects payloads with undeclared properties ({ additionalProperties: false })', () => {
        const roguePayload = {
            ...validPayload,
            undeclaredProperty: 'malicious_injection',
        }
        expect(Value.Check(CompileEpisodeSchema, roguePayload)).toBe(false)

        const errors = [...Value.Errors(CompileEpisodeSchema, roguePayload)]
        expect(errors.length).toBeGreaterThan(0)
    })

    it('rejects invalid sceneId formatting in schema validation', () => {
        const invalidScene = {
            ...validPayload,
            sceneId: 'invalid-scene-format-999',
        }
        expect(Value.Check(CompileEpisodeSchema, invalidScene)).toBe(false)
    })

    it('sanitizes directory traversal sequences and returns FORBIDDEN_COMMAND_INJECTION', () => {
        const traversal = sanitizePath('../../etc/passwd')
        expect(traversal.valid).toBe(false)
        expect(traversal.errorCode).toBe('FORBIDDEN_COMMAND_INJECTION')

        const winTraversal = sanitizePath('..\\windows\\system32')
        expect(winTraversal.valid).toBe(false)
        expect(winTraversal.errorCode).toBe('FORBIDDEN_COMMAND_INJECTION')
    })

    it('sanitizes shell injection operators and returns FORBIDDEN_COMMAND_INJECTION', () => {
        const injection = sanitizePath('/data/manifests/ep01.json; rm -rf /')
        expect(injection.valid).toBe(false)
        expect(injection.errorCode).toBe('FORBIDDEN_COMMAND_INJECTION')

        const pipeInjection = sanitizePath('/data/manifests/ep01.json | bash')
        expect(pipeInjection.valid).toBe(false)
        expect(pipeInjection.errorCode).toBe('FORBIDDEN_COMMAND_INJECTION')

        const andInjection = sanitizePath(
            '/data/ast/ep01.json && cat /etc/shadow',
        )
        expect(andInjection.valid).toBe(false)
        expect(andInjection.errorCode).toBe('FORBIDDEN_COMMAND_INJECTION')
    })

    it('sanitizes slug identifiers rejecting malformed scene patterns', () => {
        expect(sanitizeSlug('scene_01', /^ep[0-9]+_sc[0-9]+$/).valid).toBe(
            false,
        )
        expect(sanitizeSlug('ep01', /^ep[0-9]+_sc[0-9]+$/).valid).toBe(false)
        expect(sanitizeSlug('ep01sc03', /^ep[0-9]+_sc[0-9]+$/).valid).toBe(
            false,
        )
        expect(sanitizeSlug('EP01_SC03', /^ep[0-9]+_sc[0-9]+$/).valid).toBe(
            false,
        )
        expect(sanitizeSlug('ep01_sc03', /^ep[0-9]+_sc[0-9]+$/).valid).toBe(
            true,
        )
    })

    it('executes tool handler successfully on clean payload', async () => {
        const result = await compileEpisodeTool.execute(
            'call_001',
            validPayload,
            {},
        )
        expect(result.success).toBe(true)
        expect(result.receipt).toBeDefined()
        expect((result.receipt as any).status).toBe('QUEUED_FOR_RIG1_ASSEMBLY')
    })

    it('blocks tool execution when payload contains command injection in path', async () => {
        const hostilePayload = {
            ...validPayload,
            manifestPath: '/data/manifests/ep01.json; cat /etc/passwd',
        }

        const result = await compileEpisodeTool.execute(
            'call_002',
            hostilePayload,
            {},
        )
        expect(result.success).toBe(false)
        expect(result.error?.code).toBe('FORBIDDEN_COMMAND_INJECTION')
    })

    it('registers compileEpisodeTool in customTools catalog export', () => {
        expect(customTools).toBeDefined()
        expect(customTools.length).toBeGreaterThan(0)
        const registered = customTools.find((t) => t.name === 'compile_episode')
        expect(registered).toBeDefined()
        expect(registered?.description).toContain('Rig 1')
    })
})
