import { PDFDocument, PDFFont, PDFPage } from 'pdf-lib';
import fetchFileAsArrayBuffer from './fetchFileAsArrayBuffer';
import installFonts from './installFonts';

type InitDocPropsType = {
    existingPdf?: string;
    pageCount: number;
};

type InitDocResultType = {
    width: number;
    pages: Array<PDFPage>;
    pdfDoc: PDFDocument;
    height: number;
    fonts: {
        mvnBoldPdfFont: PDFFont;
        mvnMediumPdfFont: PDFFont;
        mvnRegularPdfFont: PDFFont;
        mvnSemiBoldPdfFont: PDFFont;
    };
};

export default async function initPdfDoc({
    existingPdf,
    pageCount,
}: InitDocPropsType): Promise<InitDocResultType> {
    return new Promise(async (resolve, reject) => {
        try {
            let pdfDoc: PDFDocument;
            if (!!existingPdf) {
                const pdfDocArrayBuffer =
                    await fetchFileAsArrayBuffer(existingPdf);
                pdfDoc = await PDFDocument.load(pdfDocArrayBuffer);
            } else {
                pdfDoc = await PDFDocument.create();
            }
            if (pdfDoc.getPages().length < pageCount) {
                for (let i = 0; i < pageCount; i++) {
                    pdfDoc.addPage();
                }
            }
            const pages = pdfDoc.getPages();
            if (!pages.length) {
                reject(
                    `Error: pageCount prop must be at least 1 if there is no existingPdf, current = ${pages.length}`,
                );
            }
            const { width, height } = pages[0].getSize();
            const {
                mvnRegularPdfFont,
                mvnMediumPdfFont,
                mvnSemiBoldPdfFont,
                mvnBoldPdfFont,
            } = await installFonts(pdfDoc);

            resolve({
                width,
                pages,
                pdfDoc,
                height,
                fonts: {
                    mvnBoldPdfFont,
                    mvnMediumPdfFont,
                    mvnRegularPdfFont,
                    mvnSemiBoldPdfFont,
                },
            });
        } catch (e) {
            reject(`Error: error initializing document: ${e}`);
        }
    });
}
