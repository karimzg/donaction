import initPdfDoc from '../funcs/initPdfDoc';
import validatePdfFields from '../funcs/validateFields';
import getInvoiceClubPagesData from './getInvoiceClubPagesData';
import pagesDrawer from '../funcs/pagesDrawer';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { InvoiceEntity } from '../../../_types';

export default async function GenerateClubInvoice(
    data: InvoiceEntity,
): Promise<{ file: string } | { errors: Array<string> }> {
    return new Promise(async (resolve) => {
        try {
            const VPadding = 16;
            const HPadding = 14;

            const { pdfDoc, height, width, fonts } = await initPdfDoc({
                pageCount: 1,
            });

            const messages = await validatePdfFields(data, 'CLUB_INVOICE_PDF');

            if (messages.length) {
                resolve({
                    errors: messages,
                });
            }

            const pagesData = await getInvoiceClubPagesData({
                width,
                height,
                HPadding,
                VPadding,
                fonts,
                data,
            });

            await pagesDrawer(pagesData, pdfDoc);

            try {
                const pdfFile = await pdfDoc.save();
                const date = new Date(data.dateInvoice);
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const dir = join(
                    __dirname,
                    `../../../../../private-pdf/invoices/${year}-${month}`,
                );
                if (!existsSync(dir)) {
                    mkdirSync(dir, { recursive: true });
                    console.log(`Directory created at: ${dir}`);
                } else {
                    console.log(`Directory already exists at: ${dir}`);
                }
                const pathname = join(
                    dir,
                    `${data.invoiceNumber}-${data?.klubr?.slug}.pdf`,
                );
                writeFileSync(pathname, pdfFile);
                resolve({
                    file: pathname,
                });
            } catch (e) {
                resolve({
                    errors: [e],
                });
            }
        } catch (e) {
            resolve({
                errors: [e],
            });
        }
    });
}
