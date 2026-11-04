import * as fs from 'fs';
import * as path from 'path';
import { GeneratorBit } from '../fce/generator.bit';
import { GeneratorParams, ScaffoldingReceipt, WorkspaceLayout } from '../fce/generator.interface';

export const parseParams = (rawArgs: string[]): GeneratorParams => {
  const params: Partial<GeneratorParams> = {};

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === '--manifest' && rawArgs[i + 1]) {
      params.manifest = rawArgs[++i];
    } else if (arg === '--ast' && rawArgs[i + 1]) {
      params.ast = rawArgs[++i];
    } else if (arg === '--series' && rawArgs[i + 1]) {
      params.series = rawArgs[++i];
    } else if (arg === '--out' && rawArgs[i + 1]) {
      params.out = rawArgs[++i];
    }
  }

  if (!params.manifest || !params.ast || !params.series || !params.out) {
    throw new Error('ERR_MISSING_CLI_PARAMS: Mandatory flags [--manifest, --ast, --series, --out] required.');
  }

  return params as GeneratorParams;
};

export const stageWorkspace = (outDir: string): WorkspaceLayout => {
  const resolvedOut = path.resolve(outDir);
  const layout: WorkspaceLayout = {
    rootDir: resolvedOut,
    componentsDir: path.join(resolvedOut, 'components'),
    assetsDir: path.join(resolvedOut, 'public', 'assets'),
    outDir: path.join(resolvedOut, 'out')
  };

  fs.mkdirSync(layout.rootDir, { recursive: true });
  fs.mkdirSync(layout.componentsDir, { recursive: true });
  fs.mkdirSync(layout.assetsDir, { recursive: true });
  fs.mkdirSync(layout.outDir, { recursive: true });

  return layout;
};

export const cloneStaticToolchain = (targetDir: string, templateConfigPath?: string): string[] => {
  const defaultRemotionConfig = `import { Config } from '@remotion/cli/config';

// RIG 1 HEADLESS CPU OPTICAL COMPOSITOR SPECIFICATION
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(1);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
`;

  const destPath = path.join(targetDir, 'remotion.config.ts');

  if (templateConfigPath && fs.existsSync(templateConfigPath)) {
    fs.copyFileSync(templateConfigPath, destPath);
  } else {
    fs.writeFileSync(destPath, defaultRemotionConfig, { encoding: 'utf-8' });
  }

  return [destPath];
};

export const runScaffoldBuzz = (
  ste: any,
  bale: GeneratorBit,
  bal: { slv: Function; blk: Function }
): void => {
  try {
    const rawArgs = bale.dat?.params ? [] : (process.argv.slice(2));
    const params: GeneratorParams = bale.dat?.params ?? parseParams(rawArgs);

    const layout = stageWorkspace(params.out);
    const clonedConfigs = cloneStaticToolchain(layout.rootDir);

    const receipt: ScaffoldingReceipt = {
      status: 'SUCCESS',
      layout,
      clonedConfigs
    };

    bal.slv({
      idx: bale.idx,
      val: 1,
      src: '>> [OK] [SCAFFOLD] Episode workspace staged successfully.',
      dat: { receipt }
    });
  } catch (err: any) {
    bal.slv({
      idx: bale.idx,
      val: 0,
      src: `>> [FAIL] [SCAFFOLD] Invariant violation: ${err.message}`,
      dat: { error: err.message }
    });
  }
};

