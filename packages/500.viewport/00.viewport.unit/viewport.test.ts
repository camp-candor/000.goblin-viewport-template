import { describe, it, expect, vi } from 'vitest'
import { initViewport } from './buz/viewport.buzz.js'
import { ViewportModel } from './viewport.model.js'

describe('viewport', () => {
    it('should initialize viewport', () => {
        const model = new ViewportModel()
        const state = {
            hunt: vi.fn().mockResolvedValue({}),
            dispatch: vi.fn(),
        } as any

        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        // Check if initViewport is a function and can be called
        expect(typeof initViewport).toBe('function')

        const result = initViewport(model, bal, state)
        expect(result).toBe(model)
        //expect(slv).toHaveBeenCalledWith({ intBit: { idx: 'init-viewport' } });
    })

    it('should wake up the viewport if url is provided', async () => {
        const model = new ViewportModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urlviewport =
            'https://zero00-viewport.onrender.com/api/viewport/test'

        const mockResponseviewport = { status: 'viewport-awake' }

        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urlviewport) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockResponseviewport),
                    } as any)
                }
                return Promise.reject(new Error('Unknown URL'))
            })

        initViewport(model, bal, state)

        // Wait for the promise in initViewport to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urlviewport)
        expect(slv).toHaveBeenCalledWith({
            intBit: {
                idx: 'init-viewport',
                dat: {
                    viewport: mockResponseviewport,
                },
            },
        })

        globalFetch.mockRestore()
    })

    it('should handle fetch errors', async () => {
        const model = new ViewportModel()
        const state = {} as any
        const slv = vi.fn()
        const bal = { idx: 'test', slv } as any

        const urlviewport =
            'https://zero00-viewport.onrender.com/api/viewport/test'

        const errorMessage = 'Network error'
        const globalFetch = vi
            .spyOn(global, 'fetch')
            .mockImplementation((url) => {
                if (url === urlviewport) {
                    return Promise.reject(new Error(errorMessage))
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({}),
                } as any)
            })

        initViewport(model, bal, state)

        // Wait for the promise in initViewport to resolve
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(globalFetch).toHaveBeenCalledWith(urlviewport)

        expect(slv).toHaveBeenCalledWith({
            intBit: { idx: 'init-viewport-err', dat: errorMessage },
        })

        globalFetch.mockRestore()
    })
})
