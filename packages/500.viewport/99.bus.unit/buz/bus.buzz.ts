import * as ActBus from '../../99.bus.unit/bus.action.js'

import { BusModel } from '../bus.model.js'
import BusBit from '../fce/bus.bit.js'
import State from '../../99.core/state.js'
import S from 'string'
import clone from 'clone-deep'

var lst, idx, bit, src, dat, dex

// NOTE: 97.collect.unit was repurposed as the AST harvester in Phase 5 and no
// longer backs a generic client store (WRITE/READ/FETCH_COLLECT and clcBit are
// retired). Named MQTT clients are held in this module-local registry instead.
var clientRegistry: Record<string, any> = {}

const readClient = (key: string) => {
    const client = clientRegistry[key]
    if (client == null) {
        throw new Error(
            'ERR_BUS_CLIENT_NOT_FOUND: No MQTT client registered for [' +
                key +
                '].',
        )
    }
    return client
}

export const initBus = (cpy: BusModel, bal: BusBit, ste: State) => {
    cpy.actList = []

    if (bal == null) bal = { idx: null }
    if (bal.lst == null) bal.lst = []

    if (bal.src != null && bal.src.constructor == Array) lst = bal.src

    bal.lst.forEach((a) => {
        for (var key in a) {
            cpy.actList.push(a[key])
        }
    })

    ste.bus = (idx, dat, bit) => updateBus(cpy, { idx, dat, bit }, ste)

    if (bal.dat != null) {
        cpy.MQTT = bal.dat
    } else {
        console.log('return promise')
    }

    if (lst == null) {
        if (bal.src != null) cpy.host = bal.src
        cpy.client = cpy.MQTT.connect(cpy.host)
        cpy.client.on('message', (tpc, msg) => {
            messageBus(cpy, { idx: tpc, src: msg }, ste)
        })
        cpy.client.on('connect', () => {
            console.log(bal.idx + ' connected ' + cpy.host)
            openBus(cpy, { idx: 'init-bus', lst: cpy.actList }, ste)
            if (bal.slv != null) bal.slv({ intBit: { idx: 'init-bus' } })
        })
    } else {
        var complete = (lst) => {
            lst.shift()

            if (lst.length != 0) return

            if (bal.slv != null) bal.slv({ intBit: { idx: 'init-bus' } })
        }

        lst.forEach(async (a) => {
            bit = await ste.hunt(ActBus.CREATE_BUS, {
                idx: a.idx,
                src: a.src,
            })

            var client = bit.busBit.dat
            clientRegistry[a.idx] = client

            client.on('message', (tpc, msg) => {
                messageBus(cpy, { idx: tpc, src: msg, bit: a.idx }, ste)
            })
            client.on('connect', () => {
                console.log(a.idx + ' connected ' + a.src)
                openBus(
                    cpy,
                    { idx: 'init-bus', lst: cpy.actList, bit: a.idx },
                    ste,
                )
                complete(lst)
            })
        })
    }

    return cpy
}

export const createBus = (cpy: BusModel, bal: BusBit, ste: State) => {
    var client = cpy.MQTT.connect(bal.src)
    if (bal.slv != null) bal.slv({ busBit: { idx: 'create-bus', dat: client } })

    //client.on('message', (tpc, msg) => { messageBus(cpy, { idx: tpc, src: msg, bit:bal.idx }, ste) })
    //client.on('connect', () => {
    //console.log(bal.idx + " connected " + bal.src)
    //openBus(cpy, { idx: 'init-bus', lst: cpy.actList, bit:bal.idx }, ste)
    //})

    return cpy
}

export const openBus = async (cpy: BusModel, bal: BusBit, ste: State) => {
    var out = []

    bal.lst.forEach((a) => {
        if (a == null) return
        if (a.includes == null) return
        if (a.includes('[') && a.includes(']') == false) return
        out.push(a)
    })

    var client = cpy.client

    if (bal.bit != null) {
        client = readClient(bal.bit)
    }

    out.forEach((a) => {
        client.subscribe(a, (err) => {
            if (!err) {
                console.log('subscribing ' + a)
            }
        })
    })

    return cpy
}

export const connectBus = (cpy: BusModel, bal: BusBit, ste: State) => {
    var lst = []
    //if (bal.val == 1) patch(ste, ActMnu.INIT_MENU, { lst })
}

export const messageBus = async (cpy: BusModel, bal: BusBit, ste: State) => {
    if (bal.src != null) dat = bal.src.toString()

    idx = bal.idx
    dat = JSON.parse(dat)

    var client = cpy.client

    if (bal.bit != null) {
        client = readClient(bal.bit)
    }

    if (idx.includes(cpy.responseSuffix) == true) {
        var responseIDX = bal.idx
        var obj = cpy.promises[responseIDX]

        if (obj.slv != null) obj.slv(dat)

        client.unsubscribe(responseIDX, (err) => {
            if (!err) {
                //console.log('hitting ' + responseIDX)
            }
        })
    } else {
        var bit = await ste.hunt(idx, dat)
        var cloneBit = clone(bit)

        for (var key in cloneBit) {
            var itm = cloneBit[key]
            if (itm.dat != null) {
                if (itm.dat.bit != null) itm.dat.bit = null
            }
        }

        cloneBit

        client.publish(bal.idx + cpy.responseSuffix, JSON.stringify(cloneBit))
    }

    return cpy
}

//has to return a promise
export const updateBus = async (cpy: BusModel, bal: BusBit, ste: State) => {
    //how does one create an error message here when bit should be used
    var client = cpy.client

    if (bal.bit != null) {
        client = readClient(bal.bit)
    }

    if (client == null && bal.bit == null) {
        const names = Object.keys(clientRegistry)
        if (names.length === 0) {
            throw new Error(
                'ERR_BUS_NO_CLIENTS: No MQTT client connected and none registered.',
            )
        }
        client = clientRegistry[names[0]]
    }

    var responseIDX = bal.idx + cpy.responseSuffix

    var slv
    const promo = new Promise((rslv, rjct) => (slv = rslv))

    var obj = { slv: (val0) => slv(val0) }

    cpy.promises[responseIDX] = obj

    client.subscribe(responseIDX, (err) => {
        if (!err) {
            //console.log('hitting ' + responseIDX)
        }
    })

    //03.10.23
    //bit throws errors since sometimes it is not a primitive
    //if (bal.dat == null) bal.dat = {}
    //if (bal.dat.bit != null) bal.dat.bit = null;

    client.publish(bal.idx, JSON.stringify(bal.dat))

    return promo
}

var patch = (ste, type, bale) => ste.dispatch({ type, bale })
