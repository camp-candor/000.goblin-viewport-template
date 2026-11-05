import { EdgeControlModel as EdgeControlInterface, DispatchErrorPayload } from './fce/edgecontrol.interface'

export class EdgeControlModel implements EdgeControlInterface {
    idx: string = '08.edgecontrol'
    status: 'IDLE' = 'IDLE'
    activeIntent: null = null
    latestReceipt: null = null
    errorHistory: readonly DispatchErrorPayload[] = []
    monotonicSequence: number = 0
}
