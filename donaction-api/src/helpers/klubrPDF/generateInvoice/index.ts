import path, { join } from 'path';
import initPdfDoc from '../funcs/initPdfDoc';
import validatePdfFields from '../funcs/validateFields';
import getInvoicePagesData from './getInvoicePagesData';
import pagesDrawer from '../funcs/pagesDrawer';
import getRecuNumberFromAtt from '../funcs/getRecuNumberFromAtt';
import { writeFileSync } from 'fs';

const recuPdf = path.join(
    __dirname,
    '../../../../../public/assets/recu-template.pdf',
);
const recuProPdf = path.join(
    __dirname,
    '../../../../../public/assets/recu-pro-template.pdf',
);
export default async function GenerateInvoice(
    don: any,
): Promise<{ file: string } | { errors: Array<string> }> {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(recuPdf);
            const VPadding = 34;
            const HPadding = 28;

            const { pdfDoc, height, width, fonts } = await initPdfDoc({
                existingPdf: don.estOrganisme ? recuProPdf : recuPdf,
                pageCount: 2,
            });

            const messages = await validatePdfFields(
                don,
                don?.estOrganisme ? 'COMPANY_INVOICE_PDF' : 'USER_INVOICE_PDF',
            );

            if (messages.length) {
                resolve({
                    errors: messages,
                });
            }

            const pagesData = await getInvoicePagesData({
                width,
                height,
                HPadding,
                VPadding,
                fonts,
                don,
            });

            await pagesDrawer(pagesData, pdfDoc);

            try {
                const pdfFile = await pdfDoc.save();
                const pathname = join(
                    __dirname,
                    '../../../../../private-pdf/recus',
                    `${getRecuNumberFromAtt(don?.attestationNumber)}.pdf`,
                );
                writeFileSync(pathname, pdfFile);
                resolve({
                    file: pathname,
                });
            } catch (e) {
                reject(
                    `Error occurred while generating the certificate pdf, ${e}`,
                );
            }
        } catch (e) {
            console.log('HERE 1');
            reject(e);
        }
    });
}
