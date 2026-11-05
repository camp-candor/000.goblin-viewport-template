export interface AssetFileAudit {
    filePath: string
    sizeBytes: number
    sha256: string
    isZeroByte: boolean
    isUnhydratedLfs: boolean
}

export interface StorageEnvelopeReceipt {
    status: 'SUCCESS' | 'ERROR'
    totalBytes: number
    totalMegaBytes: number
    fileCount: number
    nominalBudgetPassed: boolean // < 100 MB
    hardCeilingBreached: boolean // > 150 MB
    audits: AssetFileAudit[]
    errorMessage?: string
}

export default interface Assets {
    // idx:string;
    // Storage envelope state bit contract; AssetsModel implements structurally.
}
