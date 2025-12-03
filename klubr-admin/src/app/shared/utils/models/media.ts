import { EntityIdModel } from "./misc";

export interface Media extends EntityIdModel {
  id: number;
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: any;
  provider: string;
  provider_metadata: {
    public_id: string;
    resource_type: string;
    avatar?: boolean;
    filePath?: string;
  };
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Avatar extends EntityIdModel {
  id: number;
  name: string;
  alternativeText: any;
  caption: any;
  width: number;
  height: number;
  formats: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: any;
  provider: string;
  provider_metadata: ProviderMetadata;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderMetadata {
  avatar: boolean;
  fileId: string;
  filePath: string;
  thumbnail: boolean;
  strapiHash: string;
}
