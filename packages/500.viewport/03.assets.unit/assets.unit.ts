import { AssetsModel } from './assets.model';
import { assetsReducer } from './assets.reduce';
import * as Act from './assets.action';
import * as Buzz from './assets.buzzer';

export class AssetsUnit {
  public model: AssetsModel = new AssetsModel();

  public reduce(state: AssetsModel, action: Act.AssetsActions): AssetsModel {
    return assetsReducer(state, action);
  }

  public auditStorageEnvelope(ste: any, bale: any, bal: any): void {
    Buzz.runAuditStorageEnvelopeBuzz(ste, bale, bal);
  }
}
