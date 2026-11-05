import { RigsModel } from './rigs.model'
import { rigsReducer } from './rigs.reduce'
import * as Act from './rigs.action'
import * as Buzz from './rigs.buzzer'

export class RigsUnit {
    public model: RigsModel = new RigsModel()

    public reduce(state: RigsModel, action: Act.RigsActions): RigsModel {
        return rigsReducer(state, action)
    }

    public vendorPresentationRigs(ste: any, bale: any, bal: any): void {
        Buzz.runVendorPresentationRigsBuzz(ste, bale, bal)
    }
}

export default RigsUnit
