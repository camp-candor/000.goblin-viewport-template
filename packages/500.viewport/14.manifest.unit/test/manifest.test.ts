import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  validateRepositoryCommitMap,
  captureToolchainEnvironment,
  canonicalizeJson,
  mintProvenanceLockfile
} from '../buz/manifest.buzz';
import { MintManifestInput, RepositoryCommitMap } from '../fce/manifest.interface';

describe('14.manifest.unit: Multi-Repository Provenance Lockfile Sealing', () => {
  const tmpDir = path.resolve(__dirname, '.tmp_manifest_test');

  const validRepos: RepositoryCommitMap = {
    'worker-sower-engine': 'a1b2c3d4e5f678901234567890abcdef12345678',
    '001.goblin-lore': 'b2c3d4e5f678901234567890abcdef12345678a1',
    'goblin-assets-visual': 'c3d4e5f678901234567890abcdef12345678a1b2',
    'goblin-viewport-template': 'd4e5f678901234567890abcdef12345678a1b2c3'
  };

  const sampleInput: MintManifestInput = {
    episodeId: '040',
    seriesSlug: 'under-the-floorboards',
    targetEpisodeDir: tmpDir,
    repositories: validRepos,
    assetChecksums: {
      'characters/bog/idle.png': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    },
    compositionChecksum: '4f8a91b2c48d0e5f29910381640a23d91fca018a4f8a91b2c48d0e5f29910381',
    canonMerkleRoot: '9f8a91b2c48d0e5f29910381640a23d91fca018a4f8a91b2c48d0e5f29910381'
  };

  beforeEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    // Restore write permissions before cleanup
    const lockfile = path.join(tmpDir, 'render_manifest.json');
    if (fs.existsSync(lockfile)) {
      fs.chmodSync(lockfile, 0o666);
    }
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('[TASK-VT-9.1] verifies 40-character Git commit SHAs and rejects truncated hashes', () => {
    expect(() => validateRepositoryCommitMap(validRepos)).not.toThrow();

    const shortRepo = { ...validRepos, '001.goblin-lore': 'a1b2c3d' };
    expect(() => validateRepositoryCommitMap(shortRepo)).toThrowError(/ERR_INVALID_COMMIT_SHA/);

    const missingRepo: any = { 'worker-sower-engine': validRepos['worker-sower-engine'] };
    expect(() => validateRepositoryCommitMap(missingRepo)).toThrowError(/ERR_MISSING_REPO_COMMIT/);
  });

  it('[TASK-VT-9.2] captures toolchain environment versions with exact identifiers', () => {
    const toolchain = captureToolchainEnvironment();
    expect(toolchain.nodeVersion).toBe(process.version);
    expect(toolchain.remotionVersion).toBeDefined();
    expect(toolchain.chromiumBuild).toBeDefined();
    expect(toolchain.ffmpegVersion).toBeDefined();
  });

  it('[TASK-VT-9.3] canonicalizes JSON keys deterministically per RFC 8785', () => {
    const unorderedA = { b: 2, a: 1, c: { y: 20, x: 10 } };
    const unorderedB = { a: 1, c: { x: 10, y: 20 }, b: 2 };

    const canonA = canonicalizeJson(unorderedA);
    const canonB = canonicalizeJson(unorderedB);

    expect(canonA).toBe(canonB);
    expect(canonA).toBe('{"a":1,"b":2,"c":{"x":10,"y":20}}');
  });

  it('[TASK-VT-9.3] mints render_manifest.json and freezes file permissions to read-only', () => {
    const receipt = mintProvenanceLockfile(sampleInput);

    expect(receipt.status).toBe('SUCCESS');
    expect(receipt.isReadOnly).toBe(true);
    expect(fs.existsSync(receipt.lockfilePath)).toBe(true);

    const stat = fs.statSync(receipt.lockfilePath);
    // Verify file mode includes read-only permissions (0o444)
    expect(stat.mode & 0o222).toBe(0);

    const content = JSON.parse(fs.readFileSync(receipt.lockfilePath, 'utf8'));
    expect(content.episodeId).toBe('040');
    expect(content.lockfileSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(content.repositories['001.goblin-lore']).toBe(validRepos['001.goblin-lore']);
  });

  it('guarantees pure 7-bit ASCII constraints across emitted lockfile', () => {
    const receipt = mintProvenanceLockfile(sampleInput);
    const text = fs.readFileSync(receipt.lockfilePath, 'utf8');
    const nonAsciiRegex = /[^\x00-\x7F]/;
    expect(nonAsciiRegex.test(text)).toBe(false);
  });
});
