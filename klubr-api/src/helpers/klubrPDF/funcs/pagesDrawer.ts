import RectangleDrawer from '../entities/RectangleDrawer';
import TextBlockDrawer from '../entities/TextBlockDrawer';
import SvgPathDrawer from '../entities/SvgPathDrawer';
import CircleDrawer from '../entities/CircleDrawer';
import ImageDrawer from '../entities/ImageDrawer';
import TextDrawer from '../entities/TextDrawer';
import { PageElement } from '../entities/_types';
import { PDFDocument } from 'pdf-lib';

export default async function pagesDrawer(
    pagesData: Array<Array<PageElement>>,
    pdfDoc: PDFDocument,
): Promise<void> {
    let pagesDataIndex = 0;
    const pages = pdfDoc.getPages();

    while (pagesDataIndex < pagesData.length) {
        const pageData = pagesData[pagesDataIndex];
        const pageDrawer = pages[pagesDataIndex] || pdfDoc.addPage();
        let elementIndex = 0;

        while (elementIndex < pageData.length) {
            const element = pageData[elementIndex];

            if (element instanceof RectangleDrawer) {
                pageDrawer.drawRectangle(element.data);
            } else if (element instanceof ImageDrawer) {
                const embeddableImage = await element.getEmbeddableImage();
                const drawableImage = await pdfDoc.embedPng(embeddableImage);
                pageDrawer.drawImage(drawableImage, element.data);
            } else if (element instanceof SvgPathDrawer) {
                pageDrawer.drawSvgPath(element.data.path, {
                    x: element.data?.x || 0,
                    y: element.data?.y || pageDrawer.getHeight(),
                    ...(element.data as any),
                });
            } else if (element instanceof CircleDrawer) {
                pageDrawer.drawCircle(element.data);
            } else if (element instanceof TextDrawer) {
                pageDrawer.drawText(`${element.data.text}`, element.data);
            } else if (element instanceof TextBlockDrawer) {
                element.textBlock.forEach((_textDrawer, index) => {
                    const drawableText = element.getDrawableText(index)?.data;
                    if (drawableText) {
                        pageDrawer.drawText(drawableText.text, drawableText);
                    }
                });
            }

            elementIndex++;
        }

        pagesDataIndex++;
    }
}
