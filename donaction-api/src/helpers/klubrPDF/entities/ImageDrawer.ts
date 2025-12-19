import {PDFPageDrawImageOptions} from "pdf-lib";
import path from "path";
import BasicDrawer from "./BasicDrawer";
import convertSvgToPng from "../funcs/convertSvgToPng";
import fetchFileAsArrayBuffer from "../funcs/fetchFileAsArrayBuffer";

type ImageDrawerData =
    { url: string; isSvg?: boolean; svgWidth?: number; svgHeight?: number; isBuffer?: boolean; forceConvert?: boolean }
    & PDFPageDrawImageOptions;

export default class ImageDrawer extends BasicDrawer<ImageDrawerData> {
  async getEmbeddableImage(): Promise<ArrayBuffer> {
    let { url, isBuffer, isSvg, svgWidth, width, svgHeight, height , forceConvert} =
      this.data;
    let imageArrayBuffer: ArrayBuffer;
    if (!svgWidth || path.extname(url) !== ".svg") svgWidth = width;
    if (!svgHeight || path.extname(url) !== ".svg") svgHeight = height;
    return new Promise(async (resolve, reject) => {
      try {
        if (isBuffer) {
          resolve(new Uint8Array(url as any).buffer);
        } else if (
          (isSvg && svgWidth && svgHeight) ||
          path.extname(url) !== ".png" || forceConvert
        ) {
          imageArrayBuffer = await convertSvgToPng(url, svgWidth, svgHeight);
        } else {
          imageArrayBuffer = await fetchFileAsArrayBuffer(url);
        }
        resolve(imageArrayBuffer);
      } catch (e) {
        reject(`Error loading image: ${url}, isSvg: ${isSvg}`);
      }
    });
  }
}