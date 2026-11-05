import ManifestModel from './manifest.model';
import { reducer } from './manifest.reduce';
import * as Act from './manifest.action';
import * as Buzz from './manifest.buzzer';

export default class ManifestUnit {
  public model: ManifestModel = new ManifestModel();

  public reduce(state: ManifestModel, action: Act.Actions): ManifestModel {
    return reducer(state, action);
  }

  public mintProvenanceLockfile(ste: any, bale: any, bal: any): void {
    Buzz.runMintProvenanceLockfileBuzz(ste, bale, bal);
  }
}
