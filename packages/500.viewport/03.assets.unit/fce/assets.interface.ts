import AssetsBit from './assets.bit'

export default interface Assets {
    // idx:string;
    // assetsBitList: AssetsBit[];
    // assetsBits:any;
}

export interface AssetFileAudit {
  filePath: string;
  sizeBytes: number;
  sha256: string;
  isZeroByte: boolean;
  isUnhydratedLfs: boolean;
}

export interface StorageEnvelopeReceipt {
  status: 'SUCCESS' | 'FAIL';
  totalBytes: number;
  totalMegaBytes: number;
  fileCount: number;
  nominalBudgetPassed: boolean;
  hardCeilingBreached: boolean;
  audits: AssetFileAudit[];
}
