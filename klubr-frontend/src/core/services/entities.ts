// Queue for the api call's config

export type QueueItem = {
	config: ExecutorInterface;
	resolve: (value: any) => void;
	reject: (value: any) => void;
};

export type ExecutorInterface = {
	endPoint: string;
	method?: 'get' | 'post' | 'put' | 'delete';
	data?: Record<string, any>;
	params?: Record<string, any>;
	headers?: Record<string, any>;
	isFormData?: boolean;
	responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
	revalidate?: number;
	tags?: Array<string>;
	noCache?: boolean;
	cookies?: string;
	useDefaultHttp?: boolean;
};

export interface Avatar {
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
