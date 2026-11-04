import { ViewportModel } from '../viewport.model.js'
import ViewportBit from '../fce/viewport.bit.js'
import State from '../../99.core/state.js'

const viewport = {
    list: async () => {
        return { models: [] as any[] }
    },
}

export const initViewport = (
    cpy: ViewportModel,
    bal: ViewportBit,
    ste: State,
) => {
    const url =
        process.env.VIEWPORT_URL ||
        'https://zero00-viewport.onrender.com/api/viewport/test'
    if (url) {
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-viewport',
                            dat: {
                                viewport: data,
                            },
                        },
                    })
                }
            })
            .catch((error: any) => {
                if (bal.slv != null) {
                    bal.slv({
                        intBit: {
                            idx: 'init-viewport-err',
                            dat: error.message,
                        },
                    })
                }
            })
    } else {
        if (bal.slv != null) {
            bal.slv({ intBit: { idx: 'init-viewport' } })
        }
    }
    return cpy
}

export const updateViewport = (
    cpy: ViewportModel,
    bal: ViewportBit,
    ste: State,
) => {
    bal.slv({ intBit: { idx: 'update-viewport' } })

    return cpy
}

export const testViewport = (
    cpy: ViewportModel,
    bal: ViewportBit,
    ste: State,
) => {
    bal.slv({ mytBit: { idx: 'test-viewport', val: 1 } })
    return cpy
}

export const listViewport = async (
    cpy: ViewportModel,
    bal: ViewportBit,
    ste: State,
) => {
    const response = await viewport.list()
    if (bal.slv != null)
        bal.slv({
            olmBit: {
                idx: 'list-viewport',
                lst: response.models.map((m: any) => m.name),
            },
        })
    return cpy
}
