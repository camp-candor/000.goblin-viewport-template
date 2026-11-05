import { ModelModel } from '../model.model.js'
import ModelBit from '../fce/model.bit.js'
import ModBit from '../fce/modBit.js'

import State from '../../99.core/state.js'

var dat

// NOTE: 97.collect.unit was repurposed as the AST harvester in Phase 5 and no
// longer backs a generic collect-store (READ/WRITE/REMOVE/LIST_COLLECT and
// clcBit are retired). These buzzers resolve locally against the bale payload.

export const initModel = (cpy: ModelModel, bal: ModelBit, ste: State) => {
    return cpy
}

export const updateModel = (cpy: ModelModel, bal: ModelBit, ste: State) => {
    bal.slv({ modBit: { idx: 'update-model' } })
    return cpy
}

export const readModel = async (cpy: ModelModel, bal: ModelBit, ste: State) => {
    if (bal.idx == null) bal.idx = 'mod00'
    if (bal.dat == null) bal.dat = {}

    bal.slv({ modBit: { idx: 'read-model', dat: bal.dat } })
    return cpy
}

export const writeModel = async (
    cpy: ModelModel,
    bal: ModelBit,
    ste: State,
) => {
    if (bal.dat == null) bal.dat = {}

    dat = bal.dat
    bal.slv({ modBit: { idx: 'write-model', dat } })
    return cpy
}

export const removeModel = async (
    cpy: ModelModel,
    bal: ModelBit,
    ste: State,
) => {
    if (bal.dat == null) bal.dat = {}

    bal.slv({ modBit: { idx: 'remove-model', dat: bal.dat } })
    return cpy
}

export const deleteModel = (cpy: ModelModel, bal: ModelBit, ste: State) => {
    bal.slv({ modBit: { idx: 'delete-model' } })
    return cpy
}

export const createModel = (cpy: ModelModel, bal: ModelBit, ste: State) => {
    if (bal.dat == null) bal.dat = {}
    var modBit: ModBit = { idx: bal.idx, src: bal.dat.src }

    bal.slv({ modBit: { idx: 'create-model', dat: modBit } })
    return cpy
}

export const listModel = async (cpy: ModelModel, bal: ModelBit, ste: State) => {
    bal.slv({ modBit: { idx: 'list-model', lst: [] } })
    return cpy
}
