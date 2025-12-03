import {PDFFont, PDFPageDrawTextOptions} from "pdf-lib";
import BasicDrawer from "./BasicDrawer";

type TextDrawerData = {
    text: string;
    size: number;
    font: PDFFont;
} & PDFPageDrawTextOptions;


export default class TextDrawer extends BasicDrawer<TextDrawerData> {}
