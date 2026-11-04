import { SourceBakingBit } from './fce/sourcebaking.bit';

export const INIT_SOURCE_BAKING = 'sourcebaking:init';
export const BAKE_STATIC_COMPOSITION = 'sourcebaking:bake_static_composition';
export const PROJECT_COORDINATES = 'sourcebaking:project_coordinates';
export const INLINE_EXPOSURE_NUMBERS = 'sourcebaking:inline_exposure_numbers';

export class InitSourceBaking {
  readonly type = INIT_SOURCE_BAKING;
  constructor(public bale: SourceBakingBit) {}
}

export class BakeStaticComposition {
  readonly type = BAKE_STATIC_COMPOSITION;
  constructor(public bale: SourceBakingBit) {}
}

export class ProjectCoordinates {
  readonly type = PROJECT_COORDINATES;
  constructor(public bale: SourceBakingBit) {}
}

export class InlineExposureNumbers {
  readonly type = INLINE_EXPOSURE_NUMBERS;
  constructor(public bale: SourceBakingBit) {}
}

export type SourceBakingActions =
  | InitSourceBaking
  | BakeStaticComposition
  | ProjectCoordinates
  | InlineExposureNumbers;
