import CollectBit from './collect.bit.js'
import CaboodleBit from './caboodle.bit.js'

export default interface Collect {
    idx: string
    caboodleBitList: CaboodleBit[]
    caboodleBits: any
}

export interface DialoguePhonemeCue {
  time_ms: number;
  viseme: string;
}

export interface DialogueRound {
  speaker: string;
  emotion: string;
  phonemes: DialoguePhonemeCue[];
}

export interface NarrativeDialogueAST {
  episode_id: string;
  location_id: string;
  rounds: DialogueRound[];
}

export interface HarvestPlan {
  episodeId: string;
  environmentPlatePath: string;
  allRelativeFiles: string[];
}

export interface HarvestReceipt {
  status: 'SUCCESS' | 'FAIL';
  episodeId: string;
  stagedFiles: string[];
  totalFiles: number;
}

export interface EnvironmentManifest {
  locationId: string;
  plates: {
    standard: string;
    [key: string]: string;
  };
}

export interface CharacterAssetManifest {
  characterId: string;
  base_states: {
    idle: { file: string };
    [key: string]: { file: string };
  };
  condition_variants: {
    [emotion: string]: { file: string };
  };
  mouth_shapes: {
    [viseme: string]: string;
  };
}
