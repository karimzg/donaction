import fetchFileAsArrayBuffer from './fetchFileAsArrayBuffer';
import path from 'path';
import { PDFDocument, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const mavenRegularTtf = path.join(
    __dirname,
    '../../../../../public/assets/Maven_Pro/static/MavenPro-Regular.ttf',
);
const mavenMediumTtf = path.join(
    __dirname,
    '../../../../../public/assets/Maven_Pro/static/MavenPro-Medium.ttf',
);
const mavenSemiBoldTtf = path.join(
    __dirname,
    '../../../../../public/assets/Maven_Pro/static/MavenPro-SemiBold.ttf',
);
const mavenBoldTtf = path.join(
    __dirname,
    '../../../../../public/assets/Maven_Pro/static/MavenPro-Bold.ttf',
);

export interface MavenFonts {
    mvnRegularPdfFont: PDFFont;
    mvnMediumPdfFont: PDFFont;
    mvnSemiBoldPdfFont: PDFFont;
    mvnBoldPdfFont: PDFFont;
}

export default async function installFonts(
    pdfDoc: PDFDocument,
): Promise<MavenFonts> {
    return new Promise(async (resolve, reject) => {
        try {
            pdfDoc.registerFontkit(fontkit);
            const [
                mvnRegularPdfFont,
                mvnMediumPdfFont,
                mvnSemiBoldPdfFont,
                mvnBoldPdfFont,
            ] = await Promise.all([
                fetchFileAsArrayBuffer(mavenRegularTtf),
                fetchFileAsArrayBuffer(mavenMediumTtf),
                fetchFileAsArrayBuffer(mavenSemiBoldTtf),
                fetchFileAsArrayBuffer(mavenBoldTtf),
            ]).then(async (res) => {
                return await Promise.all([
                    pdfDoc.embedFont(res[0]),
                    pdfDoc.embedFont(res[1]),
                    pdfDoc.embedFont(res[2]),
                    pdfDoc.embedFont(res[3]),
                ]);
            });

            resolve({
                mvnRegularPdfFont,
                mvnMediumPdfFont,
                mvnSemiBoldPdfFont,
                mvnBoldPdfFont,
            });
        } catch (e) {
            reject(`Error: error loading fonts: ${e}`);
        }
    });
}
