export interface CoordinatePoint {
  x: number;
  y: number;
}

export interface RectBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharacterVariant {
  spritePath: string;
  isFallback?: boolean;
}

export interface CharacterVisualRecord {
  characterId: string;
  characterName: string;
  anchorPoint: CoordinatePoint;
  crashZoomTarget: CoordinatePoint;
  mouthBoundingBox: RectBounds;
  variants: Record<string, string>; // emotionTag -> spritePath
}

export interface VisualAssetManifest {
  manifestVersion: string;
  seriesSlug: string;
  characters: Record<string, CharacterVisualRecord>;
}

export interface VariantResolutionResult {
  characterId: string;
  requestedEmotion: string;
  resolvedEmotion: string;
  spritePath: string;
  isFallback: boolean;
  anchorPoint: CoordinatePoint;
  crashZoomTarget: CoordinatePoint;
  mouthBoundingBox: RectBounds;
}

export interface CoordinatesReceipt {
  status: 'SUCCESS' | 'ERROR';
  characterCount: number;
  manifestVersion: string;
  errorMessage?: string;
}
