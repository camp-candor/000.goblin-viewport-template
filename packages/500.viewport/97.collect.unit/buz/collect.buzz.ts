import * as fs from 'fs';
import * as path from 'path';
import { CollectBit } from '../fce/collect.bit';
import {
  NarrativeDialogueAST,
  HarvestPlan,
  HarvestReceipt,
  EnvironmentManifest,
  CharacterAssetManifest
} from '../fce/collect.interface';

/**
 * [TASK-VT-5.1] Builds an explicit harvest plan from Narrative Dialogue AST.
 */
export const planEpisodeHarvest = (
  ast: NarrativeDialogueAST,
  visualVaultPath: string
): HarvestPlan => {
  const stagedSet = new Set<string>();
  const characterSprites: string[] = [];
  const visemeSprites: string[] = [];

  // 1. Resolve and harvest active environment plate
  const envManifestPath = path.join(visualVaultPath, 'environments', ast.location_id, 'manifest.json');
  if (!fs.existsSync(envManifestPath)) {
    throw new Error(`ERR_MISSING_ENV_MANIFEST: Environment manifest missing at ${envManifestPath}`);
  }
  const envManifest: EnvironmentManifest = JSON.parse(fs.readFileSync(envManifestPath, 'utf8'));
  const envPlate = path.join('environments', ast.location_id, envManifest.plates.standard);
  stagedSet.add(envPlate);

  // 2. Crawl character dialogue AST rounds
  for (const round of ast.rounds) {
    const charDir = path.join(visualVaultPath, 'characters', round.speaker);
    const charManifestPath = path.join(charDir, 'manifest.json');
    if (!fs.existsSync(charManifestPath)) {
      throw new Error(`ERR_MISSING_CHAR_MANIFEST: Character manifest missing for ${round.speaker}`);
    }
    const manifest: CharacterAssetManifest = JSON.parse(fs.readFileSync(charManifestPath, 'utf8'));

    // Always stage the canonical idle base pose
    const idlePath = path.join('characters', round.speaker, manifest.base_states.idle.file);
    stagedSet.add(idlePath);
    characterSprites.push(idlePath);

    // Resolve condition-specific emotional variant
    const variant = manifest.condition_variants[round.emotion];
    if (variant && variant.file) {
      const variantPath = path.join('characters', round.speaker, variant.file);
      stagedSet.add(variantPath);
      characterSprites.push(variantPath);
    }

    // Harvest ONLY the specific phoneme mouth visemes declared in the audio sync cues
    if (round.phonemes && Array.isArray(round.phonemes)) {
      for (const cue of round.phonemes) {
        const mouthFile = manifest.mouth_shapes[cue.viseme];
        if (mouthFile) {
          const visemePath = path.join('characters', round.speaker, mouthFile);
          stagedSet.add(visemePath);
          visemeSprites.push(visemePath);
        }
      }
    }
  }

  return {
    episodeId: ast.episode_id,
    environmentPlatePath: envPlate,
    characterSpritePaths: Array.from(new Set(characterSprites)),
    visemeSpritePaths: Array.from(new Set(visemeSprites)),
    allRelativeFiles: Array.from(stagedSet)
  };
};

/**
 * [TASK-VT-5.1] Executes physical extraction into the destination workspace public/assets/
 */
export const executeHarvestExtraction = (
  plan: HarvestPlan,
  visualVaultPath: string,
  destinationPath: string
): HarvestReceipt => {
  const stagedFiles: string[] = [];

  for (const relFile of plan.allRelativeFiles) {
    const src = path.join(visualVaultPath, relFile);
    const dest = path.join(destinationPath, relFile);

    if (!fs.existsSync(src)) {
      throw new Error(`ERR_SOURCE_ASSET_NOT_FOUND: Required harvested asset missing on disk: ${src}`);
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    stagedFiles.push(dest);
  }

  return {
    status: 'SUCCESS',
    episodeId: plan.episodeId,
    stagedFiles,
    totalFiles: stagedFiles.length
  };
};

export const runHarvestEpisodeAssetsBuzz = (
  ste: any,
  bale: CollectBit,
  bal: { slv: Function; blk: Function }
): void => {
  try {
    const ast = bale.dat?.ast;
    const visualVaultPath = bale.dat?.visualVaultPath;
    const destinationPath = bale.dat?.destinationPath;

    if (!ast || !visualVaultPath || !destinationPath) {
      throw new Error('ERR_MISSING_HARVEST_PARAMS: ast, visualVaultPath, and destinationPath are required.');
    }

    const plan = planEpisodeHarvest(ast, visualVaultPath);
    const receipt = executeHarvestExtraction(plan, visualVaultPath, destinationPath);

    bal.slv({
      idx: bale.idx,
      val: 1,
      src: `>> [OK] [HARVEST] Cherry-picked ${receipt.totalFiles} assets for Episode ${ast.episode_id}.`,
      dat: { plan, receipt }
    });
  } catch (err: any) {
    bal.slv({
      idx: bale.idx,
      val: 0,
      src: `>> [FAIL] [HARVEST] Invariant violation: ${err.message}`,
      dat: { error: err.message }
    });
  }
};

