import { BusBit } from '../fce/bus.bit.js'
import { TelemetryLogPacket } from '../fce/bus.interface.js'

/**
 * [TASK-VT-10.3] Pure 7-Bit ASCII Log Sanitizer.
 * Strips all non-ASCII characters and UTF-8 multi-byte emojis,
 * ensuring clean terminal rendering on Windows cmd.exe and POSIX curses.
 */
export const sanitizeTo7BitAscii = (text: string): string => {
    if (!text) return ''
    return text.replace(/[^\x00-\x7F]/g, '')
}

/**
 * Formats a telemetry log packet or discrete parameters into a pure 7-bit ASCII status line.
 */
export function formatTelemetryLine(
    arg0: string | TelemetryLogPacket,
    arg1?: string,
    arg2?: string,
): string {
    if (typeof arg0 === 'string') {
        const tag = sanitizeTo7BitAscii(arg0)
        const sceneId = sanitizeTo7BitAscii(arg1 || '')
        const msg = sanitizeTo7BitAscii(arg2 || '')
        if (sceneId) {
            return `>> [${tag}] [${sceneId}] ${msg}`
        }
        return `>> [${tag}] ${msg}`
    } else {
        const packet = arg0
        const token = packet.level === 'ERROR' ? '[FAIL]' : '[OK]'
        const cleanMsg = sanitizeTo7BitAscii(packet.message)
        const tag = sanitizeTo7BitAscii(
            packet.topic || packet.tag || 'VIEWPORT',
        )
        return `>> ${token} [${tag}] ${cleanMsg}`
    }
}

/**
 * [TASK-VT-10.3] Console Telemetry Sink Router.
 * Emits telemetry directly to the right-hand cns00 Blessed console box
 * via LIBRARY bus, or falls back to standard stdout during headless test runs.
 */
export const routeTelemetryToConsole = (
    packetOrTag:
        | string
        | TelemetryLogPacket
        | { topic?: string; level?: string; message: string; tag?: string },
    sceneId?: string,
    message?: string,
): string => {
    let formattedLine: string
    if (typeof packetOrTag === 'string') {
        if (typeof sceneId === 'string') {
            formattedLine = formatTelemetryLine(packetOrTag, sceneId, message)
        } else {
            formattedLine = sanitizeTo7BitAscii(packetOrTag)
        }
    } else {
        formattedLine = formatTelemetryLine(packetOrTag as any)
    }

    const lib = (globalThis as any).LIBRARY

    if (lib && typeof lib.hunt === 'function') {
        // Route into Blessed cns00 console unit
        lib.hunt('[Console action] Update Console', {
            idx: 'cns00',
            src: formattedLine,
        })
    } else {
        // Headless fallback
        if (process.env.NODE_ENV !== 'test') {
            process.stdout.write(formattedLine + '\n')
        }
    }

    return formattedLine
}

export const runRouteTelemetryBuzz = (
    ste: any,
    bale: BusBit,
    bal: { slv: Function; blk: Function },
): void => {
    try {
        const packet = bale.dat?.packet
        if (!packet) {
            throw new Error('ERR_MISSING_PACKET: bale.dat.packet is required.')
        }

        const formatted = routeTelemetryToConsole(packet)

        bal.slv({
            idx: bale.idx,
            val: 1,
            src: formatted,
            dat: { formatted },
        })
    } catch (err: any) {
        bal.slv({
            idx: bale.idx,
            val: 0,
            src: `>> [FAIL] [BUS] Invariant violation: ${err.message}`,
            dat: { error: err.message },
        })
    }
}
