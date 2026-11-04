import * as Act from './generator.action';
import { GeneratorModel } from './generator.model';

export function generatorReducer(
  state: GeneratorModel = new GeneratorModel(),
  action: Act.GeneratorActions
): GeneratorModel {
  switch (action.type) {
    case Act.INIT_GENERATOR: {
      return { ...state, lastStatus: 'INITIALIZED' };
    }
    case Act.RUN_SCAFFOLD: {
      return { ...state, lastStatus: 'SCAFFOLDING' };
    }
    default:
      return state;
  }
}
