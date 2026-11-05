import { ManifestModel } from './manifest.model';
import { manifestReducer } from './manifest.reduce';
import * as Act from './manifest.action';
import * as Buzz from './manifest.buzzer';

export class ManifestUnit {
  public model: ManifestModel = new ManifestModel();

  public reduce(state: ManifestModel, action: Act.ManifestActions): ManifestModel {
    return manifestReducer(state, action);
  }

  public mintProvenanceLockfile(ste: any, bale: any, bal: any): void {
    Buzz.runMintProvenanceLockfileBuzz(ste, bale, bal);
  }
}
