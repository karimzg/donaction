import Image, { ImageProps } from 'next/image';
import React from 'react';
import { ExtraProps } from '@/components/media/MediaExtraProps';
import placeholder from '../../../../public/images/placeholder.svg';

type ExtendedImageProps = ImageProps & ExtraProps;

const ImageKit: React.FC<ExtendedImageProps> = (props) => {
	/* Not Used */
	/*
	const providerURL = 'https://ik.imagekit.io/klubr/';
	const mediaBreakpoints = config.media_breakpoints;
	const srcLoader = ({ src, width }) => {
		if (!src) {
			return placeholder as string;
		}
		let imageKitFile = false;
		if (src.startsWith(providerURL)) {
			src = src.replace(providerURL, '');
			imageKitFile = true;
			let transformation = '';
				transformation = (props.namedtransformation)
					? `tr:n-${props.namedtransformation}`
					: 'tr:w-' + width;
				return `${providerURL}${transformation}/${src}`;

		}
		return `${src}`;
	}
	const srcSetLoader = ({ src, width }) => {
		if (!src) {
			return undefined;
		}
		console.log('>>> src', src);
		let imageKitFile = false;
		if (src.startsWith(providerURL)) {
			imageKitFile = true;
			src = src.replace(providerURL, '');

			const nt = props.namedtransformation;
			if (props.namedtransformation) {
				return `${providerURL}tr:n-${nt}_xs/${src}   1w, ${providerURL}tr:n-${nt}/${src}   2w,
					${providerURL}tr:n-${nt}_xs_2x/${src}   15w, ${providerURL}tr:n-${nt}_2x/${src}   16w`
				// return `${providerURL}tr:n-${nt}_xs/${src}   1w, ${providerURL}tr:n-${nt}_md/${src} 2w, ${providerURL}tr:n-${nt}/${src}   3w,
				// 	${providerURL}tr:n-${nt}_xs_2x/${src}   5w, ${providerURL}tr:n-${nt}_md_2x/${src}   22w, ${providerURL}tr:n-${nt}_2x/${src}   23w`
			} else {
				let srcSet = [];
				for (const [key, value] of Object.entries(mediaBreakpoints)) {
					// if (props.namedtransformation) {
					// 	const nt = props.namedtransformation;
					// 	const ntSize = key === 'xl' ? '' : '_' + key;
					// 	srcSet.push(`${providerURL}tr:n-${nt}${ntSize}/${src} ${value}w`);
					// 	srcSet.push(`${providerURL}tr:n-${nt}${ntSize}_2x/${src}  ${value*2}w`);
					// } else {
					srcSet.push(`${providerURL}tr:w-${value},f-auto/${src} ${value}w`);
					srcSet.push(`${providerURL}tr:w-${value * 2},f-auto/${src} ${value *2}w`);
					// }
				}
				return srcSet.join(', ');
			}
		}
		return undefined;
	}
	const sizesLoader = () => {
		if (!mediaBreakpoints) {
			return undefined;
		}
		let sizes = [];
		let previousValue = 0;
		for (const [key, value] of Object.entries(mediaBreakpoints)) {
			const isLastValue = key === 'xl';
			sizes.push(`${!!previousValue ? '(min-width: '+ (previousValue + 1) +'px) and' : ''} ${!isLastValue && `(max-width: ${value}px)`} and (-webkit-device-pixel-ratio: 1) ${value}w`);
			sizes.push(`${!!previousValue ? '(min-width: '+ (previousValue + 1) +'px) and' : ''} ${!isLastValue && `(max-width: ${value}px)`} and (-webkit-min-device-pixel-ratio: 2) ${value * 2}w`);
			previousValue = +value;
		}
		return sizes.join(', ');
	}
	*/
	return (
		<Image
			{...props}
			src={(props?.src as string) || (placeholder as string)}
			alt={props?.alt || 'image'}
			// namedtransformation={undefined}
		/>
	);
	/*
		Not used:
		unoptimized={true}
		src={srcLoader({ src: props?.src, width: props?.width })}
		srcSet={srcSetLoader({ src: props?.src, width: props?.width })}
		sizes={props.namedtransformation ? props?.sizes : sizesLoader()}
	 */
};

export default ImageKit;
