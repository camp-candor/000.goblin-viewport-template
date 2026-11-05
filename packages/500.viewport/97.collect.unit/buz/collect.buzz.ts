import { CollectModel } from '../collect.model'
import CollectBit from '../fce/collect.bit.js'
import CaboodleBit from '../fce/caboodle.bit.js'
import State from '../../99.core/state.js'
import * as doT from 'dot'
import S from 'string'
import * as fs from 'fs';
import * as path from 'path';
import {
  NarrativeDialogueAST,
  HarvestPlan,
  HarvestReceipt,
  EnvironmentManifest,
  CharacterAssetManifest
} from '../fce/collect.interface';

import * as ActCol from '../../97.collect.unit/collect.action.js'
var bit, lst, dat, idx, val, src, dex

export const initCollect = (cpy: CollectModel, bal: CollectBit, ste: State) => {
    return cpy
}

export const updateCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    return cpy
}

//return the first item in a collection
export const fetchCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    if (bal.val == null) bal.val = 1

    if (bal.bit == null)
        bal.slv({ clcBit: { idx: 'fetch-collect-err', src: 'no-bit' } })
    var type = bal.bit.split(' ').slice(-1).pop().toLowerCase()
    var cabBit: CaboodleBit = cpy.caboodleBitList[cpy.caboodleBits[type]]

    if (bal.val == 1) bit = cabBit.bitList[0]
    else bit = cabBit

    if (bal.slv != null) bal.slv({ clcBit: { idx: 'fetch-collect', dat: bit } })
    return cpy
}

export const readCollect = async (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    if (bal.bit == null)
        bal.slv({ clcBit: { idx: 'read-collect-err', src: 'no-bit' } })

    var type = bal.bit.split(' ').slice(-1).pop().toLowerCase()
    if (cpy.caboodleBits[type] == null) createCollect(cpy, { idx: type }, ste)

    var cabBit: CaboodleBit = cpy.caboodleBitList[cpy.caboodleBits[type]]

    if (cabBit.bits[bal.idx] == null) {
        bit = await ste.hunt(ActCol.WRITE_COLLECT, {
            idx: bal.idx,
            src: bal.src,
            bit: bal.bit,
        })
    } else {
        dat = cabBit.bitList[cabBit.bits[bal.idx]]
    }

    if (bal.slv != null) bal.slv({ clcBit: { idx: 'read-collect', dat } })
    return cpy
}

export const writeCollect = async (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    dat = null

    //let us check see if it exists
    var type = bal.bit.split(' ').slice(-1).pop().toLowerCase()

    if (cpy.caboodleBits[type] == null) createCollect(cpy, { idx: type }, ste)

    if (bal.bit == null)
        bal.slv({ rskBit: { idx: 'write-collect-err', src: 'no-bit' } })

    var cabBit: CaboodleBit = cpy.caboodleBitList[cpy.caboodleBits[type]]

    bal.idx

    val = 0

    if (cabBit.bits[bal.idx] == null) {
        bit = await ste.hunt(bal.bit, {
            idx: bal.idx,
            src: bal.src,
            dat: bal.dat,
        })
        var objDat = bit[Object.keys(bit)[0]]
        dat = objDat.dat

        if (dat == null) dat = {}

        dat.dex = cabBit.bitList.length
        cabBit.bitList.push(dat)

        var idx = bal.idx
        if (idx == null) idx = dat.idx

        if (idx == null) throw new Error('write collect has no idx')

        cabBit.bits[idx] = dat.dex
    } else {
        var cabDat = cabBit.bitList[cabBit.bits[bal.idx]]

        bal.dat

        val = 1

        for (var key in bal.dat) {
            if (cabDat == null) cabDat = {}
            cabDat[key] = bal.dat[key]
        }

        cabBit.bitList[cabBit.bits[bal.idx]] = cabDat
        dat = cabDat

        //!!! SUPER IMPORTANT
    }

    if (dat == null && bal.slv != null)
        bal.slv({ rskBit: { idx: 'write-collect-err', src: 'no-dat' } })

    if (bal.slv != null) bal.slv({ clcBit: { idx: 'write-collect', val, dat } })

    return cpy
}

export const createCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    var cabBit: CaboodleBit = { idx: bal.idx, dex: 0, bits: {}, bitList: [] }
    cabBit.dex = cpy.caboodleBitList.length

    cpy.caboodleBitList.push(cabBit)
    cpy.caboodleBits[cabBit.idx] = cabBit.dex

    if (bal.slv != null)
        bal.slv({ clcBit: { idx: 'create-collect', dat: cabBit } })

    return cpy
}

export const removeCollect = async (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    var type = bal.bit.split(' ').slice(-1).pop().toLowerCase()

    if (cpy.caboodleBits[type] == null)
        return bal.slv({ rskBit: { idx: 'remove-collect-not-present' } })

    var cabBit: CaboodleBit = cpy.caboodleBitList[cpy.caboodleBits[type]]

    if (cabBit.bits[bal.idx] == null)
        return bal.slv({ rskBit: { idx: 'remove-collect-idx-not-present' } })

    bit = await ste.hunt(bal.bit, { idx: bal.idx, src: bal.src, dat: bal.dat })
    var objDat = bit[Object.keys(bit)[0]]
    dat = objDat.dat

    dex = dat.dex

    for (var i = dex; i < cabBit.bitList.length - 1; i++) {
        var update = cabBit.bitList[i]
        update.dex -= 1
    }

    for (var key in dat) {
        dat[key] = null
    }

    delete cabBit.bits[bal.idx]
    var itm = cabBit.bitList.splice(dex, 1)

    cabBit.dex -= 1

    if (bal.slv != null)
        bal.slv({ clcBit: { idx: 'remove-collect', dat: itm[0] } })

    return cpy
}

export const putCollect = (cpy: CollectModel, bal: CollectBit, ste: State) => {
    cpy.caboodleBits[bal.idx] = bal.val
    cpy.caboodleBitList[bal.val] = bal.dat

    if (bal.slv != null)
        bal.slv({ clcBit: { idx: 'put-collect', dat: bal.dat } })
    return cpy
}

export const getCollect = (cpy: CollectModel, bal: CollectBit, ste: State) => {
    val = cpy.caboodleBits[bal.idx]
    dat = cpy.caboodleBitList[val]

    if (bal.slv != null) bal.slv({ clcBit: { idx: 'get-collect', val, dat } })
    return cpy
}

export const modelCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    //debugger

    if (bal.slv != null) bal.slv({ clcBit: { idx: 'model-collect', dat: cpy } })
    return cpy
}

export const deleteCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    //debugger
    return cpy
}

export const emptyCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    //debugger
    return cpy
}

export const dotCollect = (cpy: CollectModel, bal: CollectBit, ste: State) => {
    var gel = bal.dat
    var out = []

    bal.src.split('\n').forEach((a, b) => {
        if (a.includes('//') == true) return
        var doTCompiled = doT.template(a)
        var outLine = doTCompiled(gel)
        out.push(outLine)
    })

    if (bal.slv != null)
        bal.slv({ clcBit: { idx: 'dot-vurt', lst: out, src: out.join('\n') } })

    return cpy
}

export const formatCollect = (
    cpy: CollectModel,
    bal: CollectBit,
    ste: State,
) => {
    lst = bal.src.split(':')

    var idx = lst[0]

    var out = []

    idx = S(idx).collapseWhitespace().s
    var opt = lst[1].split(',')
    opt.forEach((a, b) => {
        var now = S(a).collapseWhitespace().s
        if (a.length < 1) return
        out.push(now)
    })

    dat = [idx, out]

    bal.slv({ clcBit: { idx: 'format-collect', dat } })
    return cpy
}

export const listCollect = (cpy: CollectModel, bal: CollectBit, ste: State) => {
    if (bal.val == null) bal.val = 1
    var type = bal.bit.split(' ').slice(-1).pop().toLowerCase()
    if (cpy.caboodleBits[type] == null) createCollect(cpy, { idx: type }, ste)

    var cabBit: CaboodleBit = cpy.caboodleBitList[cpy.caboodleBits[type]]

    lst = []

    cabBit.bitList.forEach((a) => {
        if (bal.val == 0) {
            lst.push(a)
        } else if (bal.val == 1) {
            if (a.idx != null) lst.push(a.idx)
            if (a.id != null) lst.push(a.id)
        }
    })

    bal.slv({ clcBit: { idx: 'list-collect', lst } })

    return cpy
}

export const hashCollect = (cpy: CollectModel, bal: CollectBit, ste: State) => {
    if (bal.src == null) bal.src = ''
    lst = bal.src.split('\n')

    dat = {}

    lst.forEach((a) => {
        a = S(a).collapseWhitespace().s
        if (a.length < 3) return

        var hold = a.split(':')

        var dom = hold[0]
        var sub = hold[1]

        var now = sub.split(',')

        now.forEach((b, c) => {
            now[c] = S(b).collapseWhitespace().s
        })

        dat[dom] = now
    })

    bal.slv({ clcBit: { idx: 'hash-collect', dat } })

    return cpy
}


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
      dat: { receipt }
    });
  } catch (err: any) {
    bal.slv({
      idx: bale.idx,
      val: 0,
      src: `>> [FAIL] [HARVEST] Extraction aborted: ${err.message}`,
      dat: { error: err.message }
    });
  }
};