import initPdfDoc from '../funcs/initPdfDoc';
import validatePdfFields from '../funcs/validateFields';
import getCertificatePagesData from './getCertificatePagesData';
import pagesDrawer from '../funcs/pagesDrawer';
import { writeFileSync } from 'fs';
import { join } from 'path';

export default async function GenerateCertificate(
    don: any,
): Promise<{ file: string } | { errors: Array<string> }> {
    return new Promise(async (resolve, reject) => {
        try {
            const VPadding = 34;
            const HPadding = 28;

            const { pdfDoc, height, width, fonts } = await initPdfDoc({
                pageCount: 1,
            });

            const messages = await validatePdfFields(
                don,
                !don?.withTaxReduction
                    ? 'NO_DEDUCTION_CERTIFICATE_PDF'
                    : don?.estOrganisme
                      ? 'COMPANY_CERTIFICATE_PDF'
                      : 'USER_CERTIFICATE_PDF',
            );

            if (messages.length) {
                resolve({
                    errors: messages,
                });
            }

            const pagesData = await getCertificatePagesData({
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
                    '../../../../../private-pdf/attestations',
                    `${don?.attestationNumber}.pdf`,
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
            reject(e);
        }
    });
}
