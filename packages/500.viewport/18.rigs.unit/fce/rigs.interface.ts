export interface VendoredComponentDescriptor {
    componentName: string
    sourceTemplateFile: string
    destinationRelPath: string
}

export interface VendoringPlan {
    episodeId: string
    targetComponentsDir: string
    components: VendoredComponentDescriptor[]
}

export interface VendoredFileAudit {
    fileName: string
    destinationPath: string
    byteSize: number
    sha256: string
    hasDanglingParentImports: boolean
}

export interface RigsVendoringReceipt {
    status: 'SUCCESS' | 'ERROR'
    episodeId: string
    vendoredFiles: VendoredFileAudit[]
    totalComponentsVendored: number
    errorMessage?: string
}

export default interface Rigs {
    // idx:string;
    // Presentation rigs state bit contract; RigsModel implements structurally.
}
