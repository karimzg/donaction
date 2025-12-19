import RectangleDrawer from "./RectangleDrawer";
import ImageDrawer from "./ImageDrawer";
import TextDrawer from "./TextDrawer";
import SvgPathDrawer from "./SvgPathDrawer";
import TextBlockDrawer from "./TextBlockDrawer";

type PageElement =
    RectangleDrawer
    | ImageDrawer
    | TextDrawer
    | SvgPathDrawer
    | TextBlockDrawer;

export type {
    PageElement,
}