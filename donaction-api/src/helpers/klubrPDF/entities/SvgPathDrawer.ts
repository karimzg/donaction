import { PDFPageDrawSVGOptions } from "pdf-lib";
import BasicDrawer from "./BasicDrawer";

type SvgPathDrawerData = {
    path: string;
} & PDFPageDrawSVGOptions;

export default class SvgPathDrawer extends BasicDrawer<SvgPathDrawerData> {}