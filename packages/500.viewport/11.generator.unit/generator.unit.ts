import { GeneratorModel } from './generator.model'
import { generatorReducer } from './generator.reduce'
import * as Act from './generator.action'
import * as Buzz from './generator.buzzer'

export class GeneratorUnit {
    public model: GeneratorModel = new GeneratorModel()

    public reduce(
        state: GeneratorModel,
        action: Act.GeneratorActions,
    ): GeneratorModel {
        return generatorReducer(state, action)
    }

    public runScaffold(ste: any, bale: any, bal: any): void {
        Buzz.runScaffoldBuzz(ste, bale, bal)
    }
}

export default GeneratorUnit
