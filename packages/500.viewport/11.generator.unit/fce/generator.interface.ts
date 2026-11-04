export interface GeneratorParams {
  manifest: string;
  ast: string;
  series: string;
  out: string;
}

export interface WorkspaceLayout {
  rootDir: string;
  componentsDir: string;
  assetsDir: string;
  outDir: string;
}

export interface ScaffoldingReceipt {
  status: 'SUCCESS' | 'ERROR';
  layout: WorkspaceLayout;
  clonedConfigs: string[];
  errorMessage?: string;
}
