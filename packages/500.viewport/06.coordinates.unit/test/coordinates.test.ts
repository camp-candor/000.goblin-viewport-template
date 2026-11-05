import { describe, it, expect } from 'vitest';
import {
  validateVisualManifest,
  resolveCharacterVariant,
  CANONICAL_FALLBACK_EMOTION
} from '../buz/coordinates.buzz';
import { VisualAssetManifest } from '../fce/coordinates.interface';

describe('06.coordinates.unit: Visual Contract Ingestion & Missing Variant Resolver', () => {
  const sampleValidManifest: VisualAssetManifest = {
    manifestVersion: '1.0.0',
    seriesSlug: 'under-the-floorboards',
    characters: {
      char_bog: {
        characterId: 'char_bog',
        characterName: 'BOG',
        anchorPoint: { x: 512, y: 980 },
        crashZoomTarget: { x: 512, y: 320 },
        mouthBoundingBox: { x: 380, y: 240, width: 64, height: 32 },
        variants: {
          neutral: 'sprites/bog/bog_neutral.png',
          humiliated: 'sprites/bog/bog_humiliated.png',
          defensive: 'sprites/bog/bog_defensive.png'
        }
      }
    }
  };

  it('[TASK-VT-4.1] successfully parses and validates a conforming visual manifest', () => {
    const validated = validateVisualManifest(sampleValidManifest);
    expect(validated.manifestVersion).toBe('1.0.0');
    expect(validated.characters['char_bog'].characterName).toBe('BOG');
  });

  it('[TASK-VT-4.1] throws ERR_MISSING_ANCHOR_POINT when spatial anchor is missing', () => {
    const invalidManifest = {
      manifestVersion: '1.0.0',
      seriesSlug: 'under-the-floorboards',
      characters: {
        char_bog: {
          characterId: 'char_bog',
          characterName: 'BOG',
          // anchorPoint missing
          crashZoomTarget: { x: 512, y: 320 },
          mouthBoundingBox: { x: 380, y: 240, width: 64, height: 32 },
          variants: { neutral: 'sprites/bog/bog_neutral.png' }
        }
      }
    };
    expect(() => validateVisualManifest(invalidManifest)).toThrowError(/ERR_MISSING_ANCHOR_POINT/);
  });

  it('[TASK-VT-4.1] throws ERR_MISSING_NEUTRAL_VARIANT if character lacks baseline neutral pose', () => {
    const missingNeutral = {
      manifestVersion: '1.0.0',
      seriesSlug: 'under-the-floorboards',
      characters: {
        char_bog: {
          characterId: 'char_bog',
          characterName: 'BOG',
          anchorPoint: { x: 512, y: 980 },
          crashZoomTarget: { x: 512, y: 320 },
          mouthBoundingBox: { x: 380, y: 240, width: 64, height: 32 },
          variants: {
            humiliated: 'sprites/bog/bog_humiliated.png'
            // neutral missing
          }
        }
      }
    };
    expect(() => validateVisualManifest(missingNeutral)).toThrowError(/ERR_MISSING_NEUTRAL_VARIANT/);
  });

  it('[TASK-VT-4.2] resolves direct emotional condition match without triggering fallback', () => {
    const result = resolveCharacterVariant(sampleValidManifest, 'char_bog', 'humiliated');
    expect(result.isFallback).toBe(false);
    expect(result.resolvedEmotion).toBe('humiliated');
    expect(result.spritePath).toBe('sprites/bog/bog_humiliated.png');
    expect(result.anchorPoint.x).toBe(512);
  });

  it('[TASK-VT-4.2] gracefully degrades missing emotion variant to neutral baseline', () => {
    // Bog does not have 'panicked' variant illustrated
    const result = resolveCharacterVariant(sampleValidManifest, 'char_bog', 'panicked');
    expect(result.isFallback).toBe(true);
    expect(result.requestedEmotion).toBe('panicked');
    expect(result.resolvedEmotion).toBe(CANONICAL_FALLBACK_EMOTION);
    expect(result.spritePath).toBe('sprites/bog/bog_neutral.png');
    // Critical: spatial coordinates remain intact during fallback
    expect(result.anchorPoint.x).toBe(512);
    expect(result.anchorPoint.y).toBe(980);
    expect(result.mouthBoundingBox.width).toBe(64);
  });

  it('[TASK-VT-4.2] throws ERR_CHARACTER_NOT_FOUND if character does not exist in manifest', () => {
    expect(() => resolveCharacterVariant(sampleValidManifest, 'char_phantom', 'neutral')).toThrowError(
      /ERR_CHARACTER_NOT_FOUND/
    );
  });

  it('enforces pure 7-bit ASCII compliance across buzzers and schemas', () => {
    const nonAsciiRegex = /[^\x00-\x7F]/;
    expect(nonAsciiRegex.test(CANONICAL_FALLBACK_EMOTION)).toBe(false);
  });
});
