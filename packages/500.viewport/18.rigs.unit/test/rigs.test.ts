import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  executeRigsVendoring,
  sanitizeComponentSource,
  CANONICAL_PRIMITIVES
} from '../buz/rigs.buzz';

describe('18.rigs.unit: Presentation Primitive Isolation Rigs Vendoring', () => {
  const tmpComponentsDir = path.resolve(__dirname, '.tmp_vendored_components');

  beforeEach(() => {
    fs.rmSync(tmpComponentsDir, { recursive: true, force: true });
  });

  afterEach(() => {
    fs.rmSync(tmpComponentsDir, { recursive: true, force: true });
  });

  it('[TASK-VT-6.1] vendors GoblinPuppet.tsx into destination components directory', () => {
    const receipt = executeRigsVendoring(tmpComponentsDir, 'ep040');
    expect(receipt.status).toBe('SUCCESS');

    const puppetAudit = receipt.vendoredFiles.find((f) => f.fileName === 'GoblinPuppet.tsx');
    expect(puppetAudit).toBeDefined();
    expect(fs.existsSync(puppetAudit!.destinationPath)).toBe(true);

    const content = fs.readFileSync(puppetAudit!.destinationPath, 'utf8');
    expect(content).toContain('export const GoblinPuppet');
    expect(content).toContain('mouthBoundingBox');
  });

  it('[TASK-VT-6.2] vendors AmbientTrack.tsx into destination components directory', () => {
    const receipt = executeRigsVendoring(tmpComponentsDir, 'ep040');
    const ambientAudit = receipt.vendoredFiles.find((f) => f.fileName === 'AmbientTrack.tsx');
    expect(ambientAudit).toBeDefined();
    expect(fs.existsSync(ambientAudit!.destinationPath)).toBe(true);

    const content = fs.readFileSync(ambientAudit!.destinationPath, 'utf8');
    expect(content).toContain('export const AmbientTrack');
    expect(content).toContain('volume = 0.5');
  });

  it('[TASK-VT-6.3] vendors FoleyTrack.tsx into destination components directory', () => {
    const receipt = executeRigsVendoring(tmpComponentsDir, 'ep040');
    const foleyAudit = receipt.vendoredFiles.find((f) => f.fileName === 'FoleyTrack.tsx');
    expect(foleyAudit).toBeDefined();
    expect(fs.existsSync(foleyAudit!.destinationPath)).toBe(true);

    const content = fs.readFileSync(foleyAudit!.destinationPath, 'utf8');
    expect(content).toContain('export const FoleyTrack');
  });

  it('sanitizes external relative parent paths from vendored component imports', () => {
    const dirtySource = "import { MathUtil } from '../../../packages/math/util';";
    const cleaned = sanitizeComponentSource(dirtySource);
    expect(cleaned.includes('../')).toBe(false);
    expect(cleaned).toContain("from './packages/math/util'");
  });

  it('guarantees pure 7-bit ASCII characters across all vendored templates', () => {
    const receipt = executeRigsVendoring(tmpComponentsDir, 'ep040');
    const nonAsciiRegex = /[^\x00-\x7F]/;

    for (const file of receipt.vendoredFiles) {
      const content = fs.readFileSync(file.destinationPath, 'utf8');
      expect(nonAsciiRegex.test(content)).toBe(false);
    }
  });

  it('asserts that CANONICAL_PRIMITIVES contains exactly the 3 required components', () => {
    expect(CANONICAL_PRIMITIVES.length).toBe(3);
    const names = CANONICAL_PRIMITIVES.map((p) => p.componentName);
    expect(names).toContain('GoblinPuppet');
    expect(names).toContain('AmbientTrack');
    expect(names).toContain('FoleyTrack');
  });
});
