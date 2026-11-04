import clone from 'clone-deep'
import * as Act from './generator.action'
import { GeneratorModel } from './generator.model'
import * as Buzz from './generator.buzzer'
import State from '../99.core/state'

export function reducer(
    model: GeneratorModel = new GeneratorModel(),
    act: Act.Actions,
    state?: State,
) {
    switch (act.type) {
        case Act.UPDATE_GENERATOR:
            return Buzz.updateGenerator(clone(model), act.bale, state)

        case Act.INIT_GENERATOR:
            return Buzz.initGenerator(clone(model), act.bale, state)

        default:
            return model
    }
}
