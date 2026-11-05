export interface DialoguePhonemeCue {
  time_ms: number;
  viseme: 'closed' | 'small' | 'medium' | 'wide';
}

export interface DialogueRoundNode {
  speaker: string;
  emotion: string;
  facing?: 'N' | 'NE' | 'SE' | 'S' | 'SW' | 'NW';
  phonemes?: DialoguePhonemeCue[];
}

export interface NarrativeDialogueAST {
  episode_id: string;
  location_id: string;
  rounds: DialogueRoundNode[];
}

export interface CharacterManifestAssetEntry {
  file: string;
  sha256?: string;
}

export interface CharacterAssetManifest {
  characterId: string;
  base_states: {
    idle: CharacterManifestAssetEntry;
  };
  condition_variants: Record<string, CharacterManifestAssetEntry | null>;
  mouth_shapes: Record<string, string>;
}

export interface EnvironmentManifest {
  locationId: string;
  plates: {
    standard: string;
  };
}

export interface HarvestPlan {
  episodeId: string;
  environmentPlatePath: string;
  characterSpritePaths: string[];
  visemeSpritePaths: string[];
  allRelativeFiles: string[];
}

export interface HarvestReceipt {
  status: 'SUCCESS' | 'ERROR';
  episodeId: string;
  stagedFiles: string[];
  totalFiles: number;
  errorMessage?: string;
}
