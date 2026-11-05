import { MintManifestInput, ManifestReceipt, RenderManifestPayload } from './manifest.interface';

export default interface ManifestBit {
  idx: string;
  src?: string;
  val: number;
  dat?: {
    input?: MintManifestInput;
    manifest?: RenderManifestPayload;
    receipt?: ManifestReceipt;
    error?: string;
  };
}
