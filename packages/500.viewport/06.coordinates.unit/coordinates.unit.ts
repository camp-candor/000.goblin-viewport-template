import { CoordinatesModel } from './coordinates.model';
import { coordinatesReducer } from './coordinates.reduce';
import * as Act from './coordinates.action';
import * as Buzz from './coordinates.buzzer';

export class CoordinatesUnit {
  public model: CoordinatesModel = new CoordinatesModel();

  public reduce(state: CoordinatesModel, action: Act.CoordinatesActions): CoordinatesModel {
    return coordinatesReducer(state, action);
  }

  public parseVisualManifest(ste: any, bale: any, bal: any): void {
    Buzz.runParseVisualManifestBuzz(ste, bale, bal);
  }

  public resolveVariant(ste: any, bale: any, bal: any): void {
    Buzz.runResolveVariantBuzz(ste, bale, bal);
  }
}
