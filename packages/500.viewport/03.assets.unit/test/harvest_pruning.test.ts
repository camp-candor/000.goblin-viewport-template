import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { planEpisodeHarvest, executeHarvestExtraction } from '../../97.collect.unit/buz/collect.buzz';
import { auditStorageEnvelope, ZERO_BYTE_SHA256 } from '../buz/assets.buzz';
import { NarrativeDialogueAST } from '../../97.collect.unit/fce/collect.interface';

describe('97.collect.unit & 03.assets.unit: AST Dependency Harvesting & Storage Sentry', () => {
  const tmpVault = path.resolve(__dirname, '.tmp_vault');
  const tmpDest = path.resolve(__dirname, '.tmp_dest');

  beforeEach(() => {
    fs.rmSync(tmpVault, { recursive: true, force: true });
    fs.rmSync(tmpDest, { recursive: true, force: true });

    // Setup mock visual asset vault
    fs.mkdirSync(path.join(tmpVault, 'environments', 'env_swamp'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpVault, 'environments', 'env_swamp', 'manifest.json'),
      JSON.stringify({ locationId: 'env_swamp', plates: { standard: 'swamp_matte.png' } })
    );
    fs.writeFileSync(path.join(tmpVault, 'environments', 'env_swamp', 'swamp_matte.png'), 'DUMMY_IMAGE_DATA_1');

    fs.mkdirSync(path.join(tmpVault, 'characters', 'char_bog'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpVault, 'characters', 'char_bog', 'manifest.json'),
      JSON.stringify({
        characterId: 'char_bog',
        base_states: { idle: { file: 'bog_idle.png' } },
        condition_variants: {
          humiliated: { file: 'bog_humiliated.png' },
          enraged: { file: 'bog_enraged.png' } // Unused in this test
        },
        mouth_shapes: {
          closed: 'mouth_closed.png',
          wide: 'mouth_wide.png',
          small: 'mouth_small.png' // Unused
        }
      })
    );
    fs.writeFileSync(path.join(tmpVault, 'characters', 'char_bog', 'bog_idle.png'), 'DUMMY_IMAGE_DATA_2');
    fs.writeFileSync(path.join(tmpVault, 'characters', 'char_bog', 'bog_humiliated.png'), 'DUMMY_IMAGE_DATA_3');
    fs.writeFileSync(path.join(tmpVault, 'characters', 'char_bog', 'bog_enraged.png'), 'DUMMY_IMAGE_DATA_4');
    fs.writeFileSync(path.join(tmpVault, 'characters', 'char_bog', 'mouth_closed.png'), 'DUMMY_IMAGE_DATA_5');
    fs.writeFileSync(path.join(tmpVault, 'characters', 'char_bog', 'mouth_wide.png'), 'DUMMY_IMAGE_DATA_6');
  });

  afterEach(() => {
    fs.rmSync(tmpVault, { recursive: true, force: true });
    fs.rmSync(tmpDest, { recursive: true, force: true });
  });

  const testAst: NarrativeDialogueAST = {
    episode_id: 'ep040',
    location_id: 'env_swamp',
    rounds: [
      {
        speaker: 'char_bog',
        emotion: 'humiliated',
        phonemes: [
          { time_ms: 0, viseme: 'closed' },
          { time_ms: 100, viseme: 'wide' }
        ]
      }
    ]
  };

  it('[TASK-VT-5.1] cherry-picks only referenced assets and ignores unused takes', () => {
    const plan = planEpisodeHarvest(testAst, tmpVault);

    expect(plan.environmentPlatePath).toContain('swamp_matte.png');
    expect(plan.allRelativeFiles).toContain(path.join('characters', 'char_bog', 'bog_idle.png'));
    expect(plan.allRelativeFiles).toContain(path.join('characters', 'char_bog', 'bog_humiliated.png'));
    expect(plan.allRelativeFiles).toContain(path.join('characters', 'char_bog', 'mouth_closed.png'));
    expect(plan.allRelativeFiles).toContain(path.join('characters', 'char_bog', 'mouth_wide.png'));

    // Invariant: Unused emotion 'enraged' and unused viseme 'small' must NOT be in the staged set
    expect(plan.allRelativeFiles).not.toContain(path.join('characters', 'char_bog', 'bog_enraged.png'));
    expect(plan.allRelativeFiles).not.toContain(path.join('characters', 'char_bog', 'mouth_small.png'));

    const receipt = executeHarvestExtraction(plan, tmpVault, tmpDest);
    expect(receipt.status).toBe('SUCCESS');
    expect(receipt.totalFiles).toBe(5);
  });

  it('[TASK-VT-5.2] Zero-Byte Poison Sentinel trips on empty asset binary', () => {
    fs.mkdirSync(tmpDest, { recursive: true });
    const emptyFile = path.join(tmpDest, 'corrupted_sprite.png');
    fs.writeFileSync(emptyFile, '');

    expect(() => auditStorageEnvelope(tmpDest)).toThrowError(/ERR_ZERO_BYTE_POISON/);
  });

  it('[TASK-VT-5.2] Zero-Byte Poison Sentinel trips on unhydrated Git LFS pointer', () => {
    fs.mkdirSync(tmpDest, { recursive: true });
    const lfsPointer = path.join(tmpDest, 'lfs_stub.png');
    fs.writeFileSync(
      lfsPointer,
      'version https://git-lfs.github.com/spec/v1\noid sha256:1234567890\nsize 1024\n'
    );

    expect(() => auditStorageEnvelope(tmpDest)).toThrowError(/ERR_UNHYDRATED_LFS_POINTER/);
  });

  it('[TASK-VT-5.3] Capacity Sentry approves normal payloads under 100MB', () => {
    fs.mkdirSync(tmpDest, { recursive: true });
    fs.writeFileSync(path.join(tmpDest, 'valid_matte.png'), 'VALID_PNG_CONTENT');

    const receipt = auditStorageEnvelope(tmpDest);
    expect(receipt.nominalBudgetPassed).toBe(true);
    expect(receipt.hardCeilingBreached).toBe(false);
  });

  it('verifies the mathematical SHA-256 empty file constant', () => {
    expect(ZERO_BYTE_SHA256).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});
