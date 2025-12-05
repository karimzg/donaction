// import fetch from 'node-fetch';
import * as fs from 'fs';

export default async function fetchFileAsArrayBuffer(
    url: string,
): Promise<ArrayBuffer> {
    return new Promise(async (resolve, reject) => {
        try {
            if (url.startsWith('http')) {
                const response = await fetch(url);
                if (!response.ok) {
                    reject(`Failed to fetch ${url}: ${response}`);
                }
                resolve(await response.arrayBuffer());
            } else {
                fs.readFile(url, (err, data) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    }

                    const arrayBuffer = data?.buffer?.slice(
                        data.byteOffset,
                        data.byteOffset + data.byteLength,
                    );

                    resolve(arrayBuffer);
                });
            }
        } catch (e) {
            console.log('HERE');
            console.log(e);
            reject(e);
        }
    });
}
