import { fromPath } from 'pdf2pic';
import { join } from 'path';
import { promises as fsPromises, writeFileSync } from 'fs';

export default async function convertPdfToImage(
    pdfBuffer: Buffer,
    pdfName: string,
) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('__dirname', __dirname);
            const output = join(
                __dirname,
                '../../../../../private-pdf/posters',
            );
            await deleteAllFiles(output);
            const pathname = join(output, `${pdfName}.pdf`);
            writeFileSync(pathname, pdfBuffer);

            const options = {
                density: 100,
                saveFilename: pdfName,
                savePath: output,
                format: 'png',
                width: 595.28,
                height: 841.89,
            };
            const convert = fromPath(pathname, options);
            const pageToConvertAsImage = 1;

            convert(pageToConvertAsImage, { responseType: 'buffer' }).then(
                (res) => {
                    resolve(res.buffer);
                },
            );
        } catch (e) {
            reject(e);
        }
    });
}

async function deleteAllFiles(dir: string): Promise<void> {
    try {
        const files = await fsPromises.readdir(dir);

        await Promise.all(
            files.map(async (file) => {
                const filePath = join(dir, file);
                const stats = await fsPromises.stat(filePath);

                if (stats.isFile()) {
                    await fsPromises.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                }
            }),
        );
    } catch (error) {
        console.error(`Error deleting files in directory ${dir}:`, error);
    }
}
