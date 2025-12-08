
import CircleDrawer from "../entities/CircleDrawer";
import SvgPathDrawer from "../entities/SvgPathDrawer";
import {rgb} from "pdf-lib";

interface IRgb {
  r: number,
  g: number,
  b: number,
  a?: number
}
export default function getStatsShapes(primaryRGB: IRgb, secondaryRGB: IRgb, height: number) {
  return [
    new CircleDrawer({
      x: 80,
      y: height - 470,
      size: 50,
      color: rgb(primaryRGB.r / 255, primaryRGB.g / 255, primaryRGB.b / 255)
    }),
    new CircleDrawer({
      x: 80,
      y: height - 470,
      size: 30,
      color: rgb(1, 1, 1)
    }),
    new SvgPathDrawer({
      x: 80,
      y: height - 470,
      path: "M 0 -50 A 50 50 0 0 0 -34.7 36 L -22.4 20 A 30 30 0 0 1 0 -30 Z",
      color: rgb(1,1,1),
    }),
    new SvgPathDrawer({
      x: 80,
      y: height - 470,
      path: "M 0 -50 A 50 50 0 0 0 -34.7 36 L-34.9 36.2 A 50.2 50.2 0 0 1 0 -50.2 Z",
      color: rgb(0,0,0),
    }),
    new SvgPathDrawer({
      x: 80,
      y: height - 470,
      path: "M 0 -30 A 30 30 0 0 0 -22.4 20 L -22.6 20.2 A 30.2 30.2 0 0 1 0 -30.2 Z",
      color: rgb(0,0,0),
    }),
    //
    new CircleDrawer({
      x: 80,
      y: height - 590,
      size: 50,
      color: rgb(primaryRGB.r / 255, primaryRGB.g / 255, primaryRGB.b / 255)
    }),
    new CircleDrawer({
      x: 80,
      y: height - 590,
      size: 30,
      color: rgb(1, 1, 1)
    }),
    new SvgPathDrawer({
      x: 80,
      y: height - 590,
      path: "M 0 -50 A 50 50 0 0 0 -15 47.7 L -11.8 27.6 A 30 30 0 0 1 0 -30 Z",
      color: rgb(1,1,1),
    }),
    new SvgPathDrawer({
      x: 80,
      y: height - 590,
      path: "M 0 -50 A 50 50 0 0 0 -15 47.7 L-15.2 47.9 A 50.2 50.2 0 0 1 0 -50.2 Z",
      color: rgb(0,0,0),
    }),
    new SvgPathDrawer({
      x: 80,
      y: height - 590,
      path: "M 0 -30 A 30 30 0 0 0 -11.8 27.6 L-12 27.8 A 30.2 30.2 0 0 1 0 -30.2 Z",
      color: rgb(0,0,0),
    }),

  ];
}