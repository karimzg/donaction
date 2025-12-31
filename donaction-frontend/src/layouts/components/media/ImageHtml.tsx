import Image, { ImageProps } from 'next/image';
import React from 'react';
import { ExtraProps } from '@/components/media/MediaExtraProps';
import placeholder from '../../../../public/images/placeholder.svg';
import config from '@/config/config.json';

type ExtendedImageProps = ImageProps & ExtraProps;

const ImageHtml: React.FC<ExtendedImageProps> = (props: ExtendedImageProps) => {
	const providerURL = 'https://ik.imagekit.io/donaction/';
	const mediaBreakpoints = config.media_breakpoints;
	const srcLoader = ({ src, width }: { src?: string; width?: number }) => {
		if (!src) {
			return placeholder as string;
		}
		let imageKitFile = false;
		if (src.startsWith(providerURL)) {
			src = src.replace(providerURL, '');
			imageKitFile = true;
			let transformation = '';
			transformation = props.namedtransformation
				? `tr:n-${props.namedtransformation}`
				: 'tr:w-' + width;
			return `${providerURL}${transformation}/${src}`;
		}
		return `${src}`;
	};
	const srcSetLoader = ({ src, width }: { src?: string; width?: number }) => {
		if (!src) {
			return undefined;
		}
		if (src.startsWith(providerURL)) {
			src = src.replace(providerURL, '');

			const nt = props.namedtransformation;
			if (props.namedtransformation) {
				if (props.nosizes) {
					return `${providerURL}tr:n-${nt}/${src}   1x, ${providerURL}tr:n-${nt}_2x/${src}   2x`;
				} else {
					return `${providerURL}tr:n-${nt}_xs/${src}   1w, ${providerURL}tr:n-${nt}/${src}   2w, 
					${providerURL}tr:n-${nt}_xs_2x/${src}   15w, ${providerURL}tr:n-${nt}_2x/${src}   16w`;
				}
				// Not Used: 3 sizes version
				// return `${providerURL}tr:n-${nt}_xs/${src}   1w, ${providerURL}tr:n-${nt}_md/${src} 2w, ${providerURL}tr:n-${nt}/${src}   3w,
				// 	${providerURL}tr:n-${nt}_xs_2x/${src}   5w, ${providerURL}tr:n-${nt}_md_2x/${src}   22w, ${providerURL}tr:n-${nt}_2x/${src}   23w`
			} else {
				let srcSet = [];
				for (const [key, value] of Object.entries(mediaBreakpoints)) {
					srcSet.push(`${providerURL}tr:w-${value},f-auto/${src} ${value}w`);
					srcSet.push(`${providerURL}tr:w-${value * 2},f-auto/${src} ${value * 2}w`);
				}
				return srcSet.join(', ');
			}
		}
		return undefined;
	};
	const sizesLoader = () => {
		if (!mediaBreakpoints) {
			return undefined;
		}
		let sizes = [];
		let previousValue = 0;
		for (const [key, value] of Object.entries(mediaBreakpoints)) {
			const isLastValue = key === 'xl';
			sizes.push(
				`${!!previousValue ? '(min-width: ' + (previousValue + 1) + 'px) and' : ''} ${!isLastValue && `(max-width: ${value}px)`} and (-webkit-device-pixel-ratio: 1) ${value}w`,
			);
			sizes.push(
				`${!!previousValue ? '(min-width: ' + (previousValue + 1) + 'px) and' : ''} ${!isLastValue && `(max-width: ${value}px)`} and (-webkit-min-device-pixel-ratio: 2) ${value * 2}w`,
			);
			previousValue = +value;
		}
		return sizes.join(', ');
	};
	const isStaticSvg = (src?: { src?: string }) => src?.src && src.src.toString().endsWith('.svg');
	const isSvg = (src?: string) => typeof src === 'string' && src.toString().endsWith('.svg');
	const providedByImageKit = (src?: string) =>
		src?.toString().startsWith('https://ik.imagekit.io/donaction/');
	const cleanedProps = (prop: ExtendedImageProps) => {
		// remove namedtransformation from props by destructuring
		const { namedtransformation, nosizes, priority, ...rest } = prop;
		return rest;
	};
	return !!props.src &&
		!isStaticSvg(props.src as any) &&
		!isSvg(props.src as string) &&
		providedByImageKit(props.src as string) ? (
		<img
			{...cleanedProps(props)}
			src={srcLoader({ src: props?.src as string, width: props?.width })}
			srcSet={
				!props.noSrcSet
					? srcSetLoader({ src: props?.src as string, width: props?.width })
					: undefined
			}
			sizes={
				!props.noSrcSet && !props.nosizes
					? props.namedtransformation
						? props?.sizes
						: sizesLoader()
					: undefined
			}
			fetchPriority={props?.priority ? 'high' : undefined}
			loading={props?.priority ? undefined : 'lazy'}
			alt={props?.alt || 'image'}
			// namedtransformation={undefined}
		/>
	) : (
		<Image
			{...cleanedProps(props)}
			fetchPriority={props?.priority ? 'high' : undefined}
			loading={props?.priority ? undefined : 'lazy'}
			src={(props?.src as string) || (placeholder as string)}
			alt={props?.alt || 'image'}
			// width={props.width || 100}
			// height={props.height || 100}
			// namedtransformation={undefined}
		/>
	);
	/*

			unoptimized={false}
	loader={srcLoader}
	* srcSet={srcSetLoader({ src: props?.src, width: props?.width })}
			sizes={props.namedtransformation ? props?.sizes : sizesLoader()}
	* */
	// 	srcset={srcSetLoader({ src: props.src, width: props.width })}
};

export default ImageHtml;
