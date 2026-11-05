import { CoordinatesBit } from '../fce/coordinates.bit';
import {
  VisualAssetManifest,
  CharacterVisualRecord,
  VariantResolutionResult,
  CoordinatesReceipt
} from '../fce/coordinates.interface';

export const CANONICAL_FALLBACK_EMOTION = 'neutral';

/**
 * [TASK-VT-4.1] Visual Contract Manifest Parser.
 * Strictly asserts that character records contain mandatory spatial anchors.
 */
export const validateVisualManifest = (rawManifest: any): VisualAssetManifest => {
  if (!rawManifest || typeof rawManifest !== 'object') {
    throw new Error('ERR_INVALID_MANIFEST: Manifest must be a non-null object.');
  }

  if (!rawManifest.manifestVersion || typeof rawManifest.manifestVersion !== 'string') {
    throw new Error('ERR_MISSING_MANIFEST_VERSION: Manifest must declare manifestVersion.');
  }

  if (!rawManifest.characters || typeof rawManifest.characters !== 'object') {
    throw new Error('ERR_MISSING_CHARACTERS_MAP: Manifest must declare characters record.');
  }

  for (const [charKey, char] of Object.entries(rawManifest.characters as Record<string, any>)) {
    if (!char.characterId || !char.characterName) {
      throw new Error(`ERR_INVALID_CHARACTER_ID: Character entry [${charKey}] missing id or name.`);
    }

    if (
      !char.anchorPoint ||
      typeof char.anchorPoint.x !== 'number' ||
      typeof char.anchorPoint.y !== 'number'
    ) {
      throw new Error(`ERR_MISSING_ANCHOR_POINT: Character [${charKey}] missing valid anchorPoint.`);
    }

    if (
      !char.crashZoomTarget ||
      typeof char.crashZoomTarget.x !== 'number' ||
      typeof char.crashZoomTarget.y !== 'number'
    ) {
      throw new Error(`ERR_MISSING_CRASH_ZOOM_TARGET: Character [${charKey}] missing valid crashZoomTarget.`);
    }

    if (
      !char.mouthBoundingBox ||
      typeof char.mouthBoundingBox.x !== 'number' ||
      typeof char.mouthBoundingBox.y !== 'number' ||
      typeof char.mouthBoundingBox.width !== 'number' ||
      typeof char.mouthBoundingBox.height !== 'number'
    ) {
      throw new Error(`ERR_MISSING_MOUTH_BOUNDS: Character [${charKey}] missing valid mouthBoundingBox.`);
    }

    if (!char.variants || typeof char.variants !== 'object') {
      throw new Error(`ERR_MISSING_VARIANTS_MAP: Character [${charKey}] missing variants map.`);
    }

    // Invariant: neutral variant is mandatory baseline
    if (!char.variants[CANONICAL_FALLBACK_EMOTION]) {
      throw new Error(
        `ERR_MISSING_NEUTRAL_VARIANT: Character [${charKey}] must declare a mandatory baseline '${CANONICAL_FALLBACK_EMOTION}' variant.`
      );
    }
  }

  return rawManifest as VisualAssetManifest;
};

/**
 * [TASK-VT-4.2] Missing Variant Null Fallback Resolver.
 * Resolves requested emotional condition tags, falling back to neutral when missing.
 */
export const resolveCharacterVariant = (
  manifest: VisualAssetManifest,
  characterId: string,
  requestedEmotion: string
): VariantResolutionResult => {
  const character: CharacterVisualRecord | undefined = manifest.characters[characterId];

  if (!character) {
    throw new Error(`ERR_CHARACTER_NOT_FOUND: Character [${characterId}] not defined in visual manifest.`);
  }

  const normalizedEmotion = requestedEmotion.toLowerCase().trim();
  const directMatch = character.variants[normalizedEmotion];

  if (directMatch) {
    return {
      characterId: character.characterId,
      requestedEmotion,
      resolvedEmotion: normalizedEmotion,
      spritePath: directMatch,
      isFallback: false,
      anchorPoint: character.anchorPoint,
      crashZoomTarget: character.crashZoomTarget,
      mouthBoundingBox: character.mouthBoundingBox
    };
  }

  // Graceful degradation to neutral base pose
  const fallbackPath = character.variants[CANONICAL_FALLBACK_EMOTION];
  if (!fallbackPath) {
    throw new Error(
      `ERR_MISSING_NEUTRAL_VARIANT: Fallback failed. Character [${characterId}] missing baseline '${CANONICAL_FALLBACK_EMOTION}' variant.`
    );
  }

  return {
    characterId: character.characterId,
    requestedEmotion,
    resolvedEmotion: CANONICAL_FALLBACK_EMOTION,
    spritePath: fallbackPath,
    isFallback: true,
    anchorPoint: character.anchorPoint,
    crashZoomTarget: character.crashZoomTarget,
    mouthBoundingBox: character.mouthBoundingBox
  };
};

export const runParseVisualManifestBuzz = (
  ste: any,
  bale: CoordinatesBit,
  bal: { slv: Function; blk: Function }
): void => {
  try {
    const raw = bale.dat?.rawManifest;
    const manifest = validateVisualManifest(raw);
    const charCount = Object.keys(manifest.characters).length;

    const receipt: CoordinatesReceipt = {
      status: 'SUCCESS',
      characterCount: charCount,
      manifestVersion: manifest.manifestVersion
    };

    bal.slv({
      idx: bale.idx,
      val: 1,
      src: `>> [OK] [VISUAL] Visual contract manifest parsed (${charCount} characters).`,
      dat: { manifest, receipt }
    });
  } catch (err: any) {
    bal.slv({
      idx: bale.idx,
      val: 0,
      src: `>> [FAIL] [VISUAL] Invariant violation: ${err.message}`,
      dat: { error: err.message }
    });
  }
};

export const runResolveVariantBuzz = (
  ste: any,
  bale: CoordinatesBit,
  bal: { slv: Function; blk: Function }
): void => {
  try {
    const manifest = bale.dat?.manifest;
    const characterId = bale.dat?.characterId;
    const emotion = bale.dat?.emotion;

    if (!manifest || !characterId || !emotion) {
      throw new Error('ERR_MISSING_RESOLUTION_PARAMS: manifest, characterId, and emotion are required.');
    }

    const resolution = resolveCharacterVariant(manifest, characterId, emotion);
    const fallbackTag = resolution.isFallback ? ' [FALLBACK: neutral]' : '';

    bal.slv({
      idx: bale.idx,
      val: 1,
      src: `>> [OK] [VISUAL] Resolved [${characterId}:${emotion}] -> ${resolution.spritePath}${fallbackTag}`,
      dat: { resolution }
    });
  } catch (err: any) {
    bal.slv({
      idx: bale.idx,
      val: 0,
      src: `>> [FAIL] [VISUAL] Invariant violation: ${err.message}`,
      dat: { error: err.message }
    });
  }
};

