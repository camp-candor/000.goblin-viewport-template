import { GeneratorBit } from './fce/generator.bit';

export const INIT_GENERATOR = 'generator:init';
export const PARSE_PARAMS = 'generator:parse_params';
export const STAGE_WORKSPACE = 'generator:stage_workspace';
export const CLONE_CONFIG = 'generator:clone_config';
export const RUN_SCAFFOLD = 'generator:run_scaffold';

export class InitGenerator {
  readonly type = INIT_GENERATOR;
  constructor(public bale: GeneratorBit) {}
}

export class ParseParams {
  readonly type = PARSE_PARAMS;
  constructor(public bale: GeneratorBit) {}
}

export class StageWorkspace {
  readonly type = STAGE_WORKSPACE;
  constructor(public bale: GeneratorBit) {}
}

export class CloneConfig {
  readonly type = CLONE_CONFIG;
  constructor(public bale: GeneratorBit) {}
}

export class RunScaffold {
  readonly type = RUN_SCAFFOLD;
  constructor(public bale: GeneratorBit) {}
}

export type GeneratorActions =
  | InitGenerator
  | ParseParams
  | StageWorkspace
  | CloneConfig
  | RunScaffold;
