import sharp from 'sharp';
import fetchFileAsArrayBuffer from './fetchFileAsArrayBuffer';

export default function convertSvgToPng(
    svgContent: string,
    width: number,
    height: number,
): Promise<ArrayBuffer> {
    return new Promise(async (resolve, reject) => {
        try {
            const arrayBuffer = await fetchFileAsArrayBuffer(svgContent);
            const svgBuffer = Buffer.from(arrayBuffer);

            const pngBuffer = await sharp(svgBuffer)
                .resize(Math.floor(width), Math.floor(height))
                .png()
                .toBuffer();

            resolve(pngBuffer);
        } catch (error) {
            console.log(error, '&&&');
            reject(`Error converting SVG to PNG: ${error.message}`);
        }
    });
}
