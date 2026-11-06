// @lifecycle: generated
// @checksum: 794a8f0de95451b5e936268e4488cf4510242f1c34a290d52180cc4ba28f8c1e
// @series: wiregrass-basin
// @episode: 001
// @sealed_at: 2026-11-06T17:34:25.653Z

// @lifecycle: generated
// @series: wiregrass-basin
// @episode: 001
// @total_frames: 34

import React from 'react';
import { Composition, Sequence, Audio, staticFile } from 'remotion';

export const Episode_001: React.FC = () => {
  return (
    <div style={{ width: 1920, height: 1080, backgroundColor: '#000000', position: 'relative' }}>
      <Sequence from={0} durationInFrames={34}><Audio src={staticFile("hello.wav")} volume={1.0} /></Sequence>
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
    return (
        <Composition id="Episode_001" component={Episode_001} durationInFrames={34} fps={24} width={1920} height={1080} />
    );
};
