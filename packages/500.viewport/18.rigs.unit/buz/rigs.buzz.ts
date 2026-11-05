import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { RigsBit } from '../fce/rigs.bit';
import {
  VendoringPlan,
  RigsVendoringReceipt,
  VendoredFileAudit,
  VendoredComponentDescriptor
} from '../fce/rigs.interface';

export const CANONICAL_PRIMITIVES: VendoredComponentDescriptor[] = [
  {
    componentName: 'GoblinPuppet',
    sourceTemplateFile: 'GoblinPuppet.tsx',
    destinationRelPath: 'GoblinPuppet.tsx'
  },
  {
    componentName: 'AmbientTrack',
    sourceTemplateFile: 'AmbientTrack.tsx',
    destinationRelPath: 'AmbientTrack.tsx'
  },
  {
    componentName: 'FoleyTrack',
    sourceTemplateFile: 'FoleyTrack.tsx',
    destinationRelPath: 'FoleyTrack.tsx'
  }
];

export const DEFAULT_GOBLIN_PUPPET_SOURCE = `import React from 'react';
import { Img, staticFile } from 'remotion';

export interface GoblinPuppetProps {
  character: string;
  emotion: string;
  anchorPoint: { x: number; y: number };
  mouthBoundingBox: { x: number; y: number; width: number; height: number };
}

export const GoblinPuppet: React.FC<GoblinPuppetProps> = ({
  character,
  emotion,
  anchorPoint,
  mouthBoundingBox
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: 1024,
        height: 1024,
        transformOrigin: \`\${anchorPoint.x}px \${anchorPoint.y}px\`
      }}
    >
      <Img
        src={staticFile(\`characters/\${character}/\${emotion}.png\`)}
        style={{ width: '100%', height: '100%' }}
      />
      <div
        style={{
          position: 'absolute',
          left: mouthBoundingBox.x,
          top: mouthBoundingBox.y,
          width: mouthBoundingBox.width,
          height: mouthBoundingBox.height
        }}
      />
    </div>
  );
};
`;

export const DEFAULT_AMBIENT_TRACK_SOURCE = `import React from 'react';
import { Audio, staticFile } from 'remotion';

export interface AmbientTrackProps {
  src: string;
  volume?: number;
}

export const AmbientTrack: React.FC<AmbientTrackProps> = ({ src, volume = 0.5 }) => {
  return <Audio src={staticFile(src)} volume={volume} />;
};
`;

export const DEFAULT_FOLEY_TRACK_SOURCE = `import React from 'react';
import { Audio, staticFile } from 'remotion';

export interface FoleyTrackProps {
  src: string;
  volume?: number;
}

export const FoleyTrack: React.FC<FoleyTrackProps> = ({ src, volume = 1.0 }) => {
  return <Audio src={staticFile(src)} volume={volume} />;
};
`;

/**
 * Sanitizes code to remove dangling parent repository relative paths (../../)
 */
export const sanitizeComponentSource = (content: string): string => {
  // Strip parent traversals in module imports
  return content.replace(/from\s+['"](\.\.\/)+/g, "from './");
};

/**
 * [TASK-VT-6.1], [TASK-VT-6.2], [TASK-VT-6.3]
 * Executes physical component vendoring into target episode components/ directory.
 */
export const executeRigsVendoring = (
  targetComponentsDir: string,
  episodeId: string,
  templateSourceDir?: string
): RigsVendoringReceipt => {
  if (!fs.existsSync(targetComponentsDir)) {
    fs.mkdirSync(targetComponentsDir, { recursive: true });
  }

  const audits: VendoredFileAudit[] = [];

  for (const item of CANONICAL_PRIMITIVES) {
    const destFile = path.join(targetComponentsDir, item.destinationRelPath);
    let content = '';

    if (templateSourceDir && fs.existsSync(path.join(templateSourceDir, item.sourceTemplateFile))) {
      content = fs.readFileSync(path.join(templateSourceDir, item.sourceTemplateFile), 'utf8');
    } else {
      if (item.componentName === 'GoblinPuppet') content = DEFAULT_GOBLIN_PUPPET_SOURCE;
      else if (item.componentName === 'AmbientTrack') content = DEFAULT_AMBIENT_TRACK_SOURCE;
      else if (item.componentName === 'FoleyTrack') content = DEFAULT_FOLEY_TRACK_SOURCE;
    }

    const sanitized = sanitizeComponentSource(content);
    fs.writeFileSync(destFile, sanitized, { encoding: 'utf8' });

    const buffer = Buffer.from(sanitized, 'utf8');
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const hasDangling = sanitized.includes('../');

    audits.push({
      fileName: item.destinationRelPath,
      destinationPath: destFile,
      byteSize: buffer.length,
      sha256,
      hasDanglingParentImports: hasDangling
    });
  }

  return {
    status: 'SUCCESS',
    episodeId,
    vendoredFiles: audits,
    totalComponentsVendored: audits.length
  };
};

export const runVendorPresentationRigsBuzz = (
  ste: any,
  bale: RigsBit,
  bal: { slv: Function; blk: Function }
): void => {
  try {
    const targetDir = bale.dat?.targetDir;
    const plan = bale.dat?.plan;

    const componentsDir = targetDir || plan?.targetComponentsDir;
    const episodeId = plan?.episodeId || 'epXXX';

    if (!componentsDir) {
      throw new Error('ERR_MISSING_TARGET_COMPONENTS_DIR: targetDir or plan.targetComponentsDir required.');
    }

    const receipt = executeRigsVendoring(componentsDir, episodeId);

    bal.slv({
      idx: bale.idx,
      val: 1,
      src: `>> [OK] [RIGS] Vendored ${receipt.totalComponentsVendored} presentation components for Episode ${episodeId}.`,
      dat: { receipt }
    });
  } catch (err: any) {
    bal.slv({
      idx: bale.idx,
      val: 0,
      src: `>> [FAIL] [RIGS] Invariant violation: ${err.message}`,
      dat: { error: err.message }
    });
  }
};
