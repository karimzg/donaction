import React from 'react';

export interface ExtraProps {
	width?: number;
	height?: number;
	mobileHeight?: number;
	mobileWidth?: number;
	namedtransformation?: string;
	noSrcSet?: boolean;
	nosizes?: boolean;
}
type ExtendedMediaLoaderProps = React.ImgHTMLAttributes<HTMLImageElement> & ExtraProps;
