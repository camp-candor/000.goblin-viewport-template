import { SealsModel } from './seals.model'
import { sealsReducer } from './seals.reduce'
import * as Act from './seals.action'
import * as Buzz from './seals.buzzer'

export class SealsUnit {
    public model: SealsModel = new SealsModel()

    public reduce(state: SealsModel, action: Act.SealsActions): SealsModel {
        return sealsReducer(state, action)
    }

    public emitSealedComposition(ste: any, bale: any, bal: any): void {
        Buzz.runEmitSealedCompositionBuzz(ste, bale, bal)
    }
}

export default SealsUnit
