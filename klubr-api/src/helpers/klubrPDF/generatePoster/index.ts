import initPdfDoc from "../funcs/initPdfDoc";
import validatePdfFields from "../funcs/validateFields";
import getProjectPosterPagesData from "./getProjectPosterPagesData";
import getClubPosterPagesData from "./getClubPosterPagesData";
import pagesDrawer from "../funcs/pagesDrawer";

type IType = 'CLUB' | 'PROJECT'
export default async function GeneratePoster(data: any, type: IType): Promise<{file: Uint8Array} | {errors: Array<string>}> {
  return new Promise(async (resolve, reject) => {
    try {
      const VPadding = 10;
      const HPadding = 10;

      const {pdfDoc, height, width, fonts} = await initPdfDoc({
        pageCount: 1,
      });

      const messages = await validatePdfFields(
          data,
          type === "CLUB" ? "CLUB_POSTER_PDF" : "PROJECT_POSTER_PDF"
      );

      if (messages.length) {
        resolve({
          errors: messages,
        });
      }

      const pagesData = await (type === "CLUB"
          ? getClubPosterPagesData
          : getProjectPosterPagesData)({
        width,
        height,
        HPadding,
        VPadding,
        fonts,
        data,
      });
      await pagesDrawer(pagesData, pdfDoc);

      const pdfFile = await pdfDoc.save();
      resolve({
        file: pdfFile,
      });
    } catch (e) {
      reject(e);
    }
  });
}
