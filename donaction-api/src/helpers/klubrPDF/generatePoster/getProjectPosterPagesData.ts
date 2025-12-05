import path from 'path';
import { MavenFonts } from '../funcs/installFonts';
import { PageElement } from '../entities/_types';
import hexToRgb from '../funcs/hexToRgb';
import QRCode from 'qrcode';
import ImageDrawer from '../entities/ImageDrawer';
import isImage from '../funcs/isImage';
import { getMediaPath, MEDIAS_TRANSFORMATIONS } from '../../medias';
import RectangleDrawer from '../entities/RectangleDrawer';
import { BlendMode, rgb } from 'pdf-lib';
import SvgPathDrawer from '../entities/SvgPathDrawer';
import TextDrawer from '../entities/TextDrawer';
import CircleDrawer from '../entities/CircleDrawer';
import TextBlockDrawer from '../entities/TextBlockDrawer';

const hand = path.join(
    __dirname,
    '../../../../../public/assets/icons/hand.png',
);
const logoKlubr = path.join(
    __dirname,
    '../../../../../public/assets/icons/logo.png',
);
const note = path.join(
    __dirname,
    '../../../../../public/assets/icons/note.png',
);
const piggie = path.join(
    __dirname,
    '../../../../../public/assets/icons/piggie.png',
);

interface IGetProjectPosterPagesData {
    height: number;
    width: number;
    HPadding: number;
    VPadding: number;
    fonts: MavenFonts;
    data: any; // TODO: type
}
export default async function getProjectPosterPagesData({
    height,
    width,
    HPadding,
    VPadding,
    fonts,
    data,
}: IGetProjectPosterPagesData): Promise<Array<Array<PageElement>>> {
    const primaryRGB = data?.klubr?.klubr_house?.poster_primary_color
        ? hexToRgb(data?.klubr?.klubr_house?.poster_primary_color)
        : data?.klubr?.klubr_house?.primary_color
          ? hexToRgb(data?.klubr?.klubr_house?.primary_color)
          : { r: 1, g: 1, b: 1 };

    const secondaryRGB = data?.klubr?.klubr_house?.secondary_color
        ? hexToRgb(data?.klubr?.klubr_house?.secondary_color)
        : { r: 1, g: 1, b: 1 };

    let descriptionText =
        data?.descriptionCourte[0]?.children?.reduce(
            (acc, curr) => acc + `${curr.text} `,
            '',
        ) || '';

    if (descriptionText?.length > 200) {
        descriptionText = descriptionText.slice(0, 200) + '...';
    }

    const qrCodeUrl = `https://donaction.fr/${data?.klubr?.slug}/nos-projets/${data?.slug}?PAYEMENT_FORM=true`;
    const qrCodeBuffer = await QRCode.toBuffer(
        `${qrCodeUrl}&utm_medium=poster&utm_source=${data?.denomination}&utm_content=${qrCodeUrl}&utm_campaign=${data?.slug}`,
        {
            margin: 1,
        },
    );
    const qrCode = qrCodeBuffer
        ? [
              new ImageDrawer({
                  url: qrCodeBuffer,
                  isBuffer: true,
                  height: 86,
                  width: 86,
                  x: HPadding,
                  y: 20,
              }),
          ]
        : [];

    let logoWidth = 60 * (data?.klubr?.logo?.width / data?.klubr?.logo?.height);
    let logoHeight = 60;
    if (logoWidth > 150) {
        logoWidth = 150;
        logoHeight =
            150 * (data?.klubr?.logo?.height / data?.klubr?.logo?.width);
    }

    const page1 = [
        new ImageDrawer({
            url: isImage(data?.couverture?.url)
                ? getMediaPath(
                      data?.couverture,
                      MEDIAS_TRANSFORMATIONS.POSTER_IMG,
                  )
                : path.extname(data?.klubr?.logo.url) !== '.svg'
                  ? getMediaPath(
                        data?.klubr?.logo,
                        MEDIAS_TRANSFORMATIONS.POSTER_IMG,
                    )
                  : data?.klubr?.logo.url,
            x: HPadding,
            y: height - VPadding - 400,
            width: width - HPadding * 2,
            height: 400,
            svgWidth: (data?.couverture || data?.klubr?.logo)?.width,
            svgHeight: (data?.couverture || data?.klubr?.logo)?.height,
        }),
        new RectangleDrawer({
            x: HPadding,
            y: height - VPadding - 400,
            height: 400,
            width: width - HPadding * 2,
            color: rgb(8 / 255, 35 / 255, 49 / 255),
            opacity: 0.52,
        }),
        new SvgPathDrawer({
            path: `M20 0 H${width - HPadding * 2 - 20} L${
                (width - HPadding * 2) / 2
            } 70 Z`,
            x: HPadding,
            y: height - VPadding,
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            path: 'M179.968 19.5103C190.798 15.9907 188.265 0 176.877 0H10C4.47716 0 0 4.47715 0 10V64.2351C0 71.0291 6.62956 75.8454 13.0909 73.7455L179.968 19.5103Z',
            x: HPadding,
            y: height - VPadding,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
            opacity: 0.42,
        }),

        // BORDERS 1
        new SvgPathDrawer({
            path: 'M0 0 L 20 0 A 20 20 0 0 0 0 20 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding,
        }),
        new SvgPathDrawer({
            path: `M0 0 L-20 0 A20 20 0 0 1 1 20 Z`,
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding,
        }),
        new SvgPathDrawer({
            path: 'M0 0 L0 -20 A20 20 0 0 0 20 0 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding - 400,
        }),
        new SvgPathDrawer({
            path: 'M0 0 L-20 0 A20 20 0 0 0 1 -20 Z',
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding - 400,
        }),
        new SvgPathDrawer({
            path: 'M-1 -1 H20 A20 20 0 0 0 -1 20 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding,
        }),
        new SvgPathDrawer({
            path: `M1 -1 H-20 A20 20 0 0 1 1 20 Z`,
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding,
        }),
        new SvgPathDrawer({
            path: 'M-1 1 H20 A20 20 0 0 1 -1 -20 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding - 400,
        }),
        new SvgPathDrawer({
            path: 'M1 1 H-20 A20 20 0 0 0 1 -20 Z',
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding - 400,
        }),
        // /BORDERS 1
        new ImageDrawer({
            url:
                path.extname(data?.klubr?.logo.url) !== '.svg' &&
                path.extname(data?.klubr?.logo.url) !== '.png'
                    ? getMediaPath(
                          data?.klubr?.logo,
                          MEDIAS_TRANSFORMATIONS.POSTER_LOGO,
                      )
                    : data?.klubr?.logo.url,
            blendMode: BlendMode.Multiply,
            x: 297.64 - logoWidth / 2,
            y: height - (logoHeight + 15),
            width: logoWidth,
            height: logoHeight,
        }),
        new TextDrawer({
            text: 'Soutenez notre projet',
            size: 20,
            font: fonts.mvnRegularPdfFont,
            color: rgb(1, 1, 1),
            x: HPadding * 2 + 10,
            y: height - 130,
        }),
        new TextDrawer({
            text: data?.titre?.trim(),
            size: 32,
            font: fonts.mvnBoldPdfFont,
            color: rgb(1, 1, 1),
            x: HPadding * 2 + 10,
            y: height - 175,
            maxWidth: 260,
            lineHeight: 40,
        }),
        new TextDrawer({
            text: descriptionText,
            size: 18,
            font: fonts.mvnMediumPdfFont,
            color: rgb(1, 1, 1),
            x: 300,
            y: height - 165,
            maxWidth: 280,
        }),
        new TextDrawer({
            text: 'Avec',
            size: 20,
            font: fonts.mvnRegularPdfFont,
            color: rgb(1, 1, 1),
            x: width - 100,
            y: height - 350,
        }),
        new ImageDrawer({
            url: logoKlubr,
            x: width - 100,
            y: height - 385,
            width: 86,
            height: 24,
        }),
        new RectangleDrawer({
            x: HPadding,
            y: height - VPadding - 535,
            height: 123,
            width: width - HPadding * 2,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
        }),

        // BORDERS 2
        new SvgPathDrawer({
            path: 'M0 0 L 20 0 A 20 20 0 0 0 0 20 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding - 412,
        }),
        new SvgPathDrawer({
            path: 'M0 0 L-20 0 A20 20 0 0 1 1 20 Z',
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding - 412,
        }),
        new SvgPathDrawer({
            path: 'M0 0 L0 -20 A20 20 0 0 0 20 0 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding - 535,
        }),
        new SvgPathDrawer({
            path: 'M0 0 L-20 0 A20 20 0 0 0 1 -20 Z',
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding - 535,
        }),
        new SvgPathDrawer({
            path: 'M-1 -1 H20 A20 20 0 0 0 -1 20 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding - 412,
        }),
        new SvgPathDrawer({
            path: 'M1 -1 H-20 A20 20 0 0 1 1 20 Z',
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding - 412,
        }),
        new SvgPathDrawer({
            path: 'M-1 1 H20 A20 20 0 0 1 -1 -20 Z',
            color: rgb(1, 1, 1),
            x: HPadding,
            y: height - VPadding - 535,
        }),
        new SvgPathDrawer({
            path: 'M1 1 H-20 A20 20 0 0 0 1 -20 Z',
            color: rgb(1, 1, 1),
            x: width - HPadding,
            y: height - VPadding - 535,
        }),
        // /BORDERS 2
        new ImageDrawer({
            url: hand,
            x: 100,
            y: height - 500,
            height: 115,
            width: 193.05,
        }),
        new TextDrawer({
            text: 'Soutenez',
            font: fonts.mvnBoldPdfFont,
            size: 22,
            x: HPadding * 2,
            y: height - 470,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'le club à hauteur de',
            font: fonts.mvnMediumPdfFont,
            size: 22,
            x: HPadding * 2,
            y: height - 495,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: '100€',
            font: fonts.mvnBoldPdfFont,
            size: 22,
            x: HPadding * 2,
            y: height - 520,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'Et bénéficiez',
            font: fonts.mvnBoldPdfFont,
            size: 22,
            x: 360,
            y: height - 450,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: `d'une réduction`,
            font: fonts.mvnMediumPdfFont,
            size: 22,
            x: 360,
            y: height - 475,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'd’impôt',
            font: fonts.mvnMediumPdfFont,
            size: 22,
            x: 360,
            y: height - 500,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'De 60€ à 66€',
            font: fonts.mvnBoldPdfFont,
            size: 22,
            x: 360,
            y: height - 525,
            color: rgb(1, 1, 1),
        }),
        new ImageDrawer({
            url: piggie,
            x: width - 75,
            y: height - 555,
            width: 58.85,
            height: 73.32,
        }),
        new CircleDrawer({
            color: rgb(1, 1, 1),
            size: 71,
            x: (width - HPadding * 2) / 2,
            y: height - VPadding - 535,
        }),
        new CircleDrawer({
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
            size: 20,
            x: (width - HPadding * 2) / 2 + 40,
            y: height - VPadding - 465,
        }),
        new CircleDrawer({
            color: rgb(1, 1, 1),
            size: 18,
            x: (width - HPadding * 2) / 2 + 40,
            y: height - VPadding - 465,
        }),
        new SvgPathDrawer({
            path: 'M8.10162 20.9611C7.76355 20.9611 7.43013 20.8824 7.12777 20.7312C6.82541 20.5799 6.56243 20.3604 6.35966 20.0899L1.01874 12.9685C0.847161 12.7397 0.722329 12.4794 0.651366 12.2024C0.580403 11.9254 0.564696 11.6371 0.605148 11.354C0.645599 11.0709 0.741415 10.7985 0.887123 10.5525C1.03283 10.3064 1.22558 10.0914 1.45436 9.91986C1.68314 9.74829 1.94348 9.62346 2.22051 9.5525C2.49753 9.48153 2.78582 9.46583 3.06892 9.50628C3.35201 9.54673 3.62436 9.64254 3.87043 9.78825C4.11649 9.93396 4.33145 10.1267 4.50303 10.3555L7.99724 15.0141L16.9717 1.55261C17.2922 1.07244 17.7903 0.739201 18.3565 0.626151C18.9226 0.513101 19.5105 0.629493 19.9909 0.949741C20.4712 1.26999 20.8048 1.76788 20.9182 2.33397C21.0316 2.90006 20.9156 3.48801 20.5956 3.96857L9.91377 19.9913C9.72054 20.2811 9.46065 20.5203 9.15589 20.689C8.85113 20.8576 8.51039 20.9507 8.16223 20.9604C8.14203 20.9608 8.12182 20.9611 8.10162 20.9611Z',
            x: (width - HPadding * 2) / 2 + 30,
            y: height - VPadding - 455,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
        }),
        new TextDrawer({
            text: 'Exemple',
            size: 18,
            x: (width - HPadding * 2) / 2 - 30,
            y: height - VPadding - 505,
            font: fonts.mvnBoldPdfFont,
        }),
        new TextDrawer({
            text: 'de don',
            size: 18,
            x: (width - HPadding * 2) / 2 - 25,
            y: height - VPadding - 523,
            font: fonts.mvnBoldPdfFont,
        }),
        // stats
        new CircleDrawer({
            x: 110,
            y: height - 610,
            size: 50,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
        }),
        new CircleDrawer({
            x: 110,
            y: height - 610,
            size: 30,
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            x: 110,
            y: height - 610,
            path: 'M 0 -50 A 50 50 0 0 0 -34.7 36 L -22.4 20 A 30 30 0 0 1 0 -30 Z',
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            x: 110,
            y: height - 610,
            path: 'M 0 -50 A 50 50 0 0 0 -34.7 36 L-34.9 36.2 A 50.2 50.2 0 0 1 0 -50.2 Z',
            color: rgb(0, 0, 0),
        }),
        new SvgPathDrawer({
            x: 110,
            y: height - 610,
            path: 'M 0 -30 A 30 30 0 0 0 -22.4 20 L -22.6 20.2 A 30.2 30.2 0 0 1 0 -30.2 Z',
            color: rgb(0, 0, 0),
        }),
        new TextDrawer({
            text: '66%',
            font: fonts.mvnBoldPdfFont,
            size: 18,
            color: rgb(0, 0, 0),
            x: 95,
            y: height - 615,
        }),
        new TextDrawer({
            text: 'Particulier (IRPP)',
            maxWidth: 150,
            font: fonts.mvnBoldPdfFont,
            size: 22,
            color: rgb(0, 0, 0),
            x: 175,
            y: height - 605,
        }),
        new TextDrawer({
            text: '*',
            font: fonts.mvnBoldPdfFont,
            size: 32,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
            x: 287,
            y: height - 610,
        }),
        ////////
        new CircleDrawer({
            x: 380,
            y: height - 610,
            size: 50,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
        }),
        new CircleDrawer({
            x: 380,
            y: height - 610,
            size: 30,
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            x: 380,
            y: height - 610,
            path: 'M 0 -50 A 50 50 0 0 0 -15 47.7 L -11.8 27.6 A 30 30 0 0 1 0 -30 Z',
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            x: 380,
            y: height - 610,
            path: 'M 0 -50 A 50 50 0 0 0 -15 47.7 L-15.2 47.9 A 50.2 50.2 0 0 1 0 -50.2 Z',
            color: rgb(0, 0, 0),
        }),
        new SvgPathDrawer({
            x: 380,
            y: height - 610,
            path: 'M 0 -30 A 30 30 0 0 0 -11.8 27.6 L-12 27.8 A 30.2 30.2 0 0 1 0 -30.2 Z',
            color: rgb(0, 0, 0),
        }),
        new TextDrawer({
            text: '60%',
            font: fonts.mvnBoldPdfFont,
            size: 18,
            color: rgb(0, 0, 0),
            x: 365,
            y: height - 615,
        }),
        new TextDrawer({
            text: 'Entreprise (IR ou IS)',
            maxWidth: 150,
            font: fonts.mvnBoldPdfFont,
            size: 22,
            color: rgb(0, 0, 0),
            x: 445,
            y: height - 605,
        }),
        //
        new SvgPathDrawer({
            path: `M0 ${height - 115} L170 ${height - 150} L${width} ${
                height - 100
            } V${height - 15} L170 ${height - 60} L0 ${height - 15} Z`,
            x: 0,
            y: height,
            color: rgb(247 / 255, 247 / 255, 247 / 255),
            opacity: 0.8,
            blendMode: BlendMode.Multiply,
        }),
        ...qrCode,
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Scannez le QR code &',
                    font: fonts.mvnMediumPdfFont,
                    size: 12,
                    color: rgb(
                        primaryRGB.r / 255,
                        primaryRGB.g / 255,
                        primaryRGB.b / 255,
                    ),
                }),
                new TextDrawer({
                    text: 'Aider votre club en 3 clics',
                    font: fonts.mvnSemiBoldPdfFont,
                    size: 16,
                    color: rgb(
                        primaryRGB.r / 255,
                        primaryRGB.g / 255,
                        primaryRGB.b / 255,
                    ),
                    maxWidth: 150,
                    lineHeight: 16,
                }),
            ],
            {
                x: HPadding,
                y: 150,
                isRtl: false,
                extraLineHeight: 3,
            },
        ),
        new ImageDrawer({
            url: logoKlubr,
            x: HPadding + 110,
            y: 35,
            width: 64.05,
            height: 17.85,
        }),
        new TextDrawer({
            text: 'www.donaction.fr',
            size: 13,
            font: fonts.mvnMediumPdfFont,
            x: HPadding + 110,
            y: 20,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Grâce à Klubr !',
                    font: fonts.mvnMediumPdfFont,
                    size: 16,
                    color: rgb(0, 0, 0),
                }),
                new TextDrawer({
                    text: 'Réception immédiate de',
                    font: fonts.mvnRegularPdfFont,
                    size: 16,
                    color: rgb(0, 0, 0),
                }),
            ],
            {
                x: 370,
                y: 140,
                isRtl: false,
                extraLineHeight: 0,
            },
        ),
        new CircleDrawer({
            x: 380.5,
            y: 90.5,
            size: 10.5,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
        }),
        new TextDrawer({
            text: '1',
            size: 14,
            font: fonts.mvnBoldPdfFont,
            x: 377,
            y: 86,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'Attestation de paiement',
            size: 14,
            font: fonts.mvnMediumPdfFont,
            x: 400,
            y: 86,
            color: rgb(0, 0, 0),
        }),
        new CircleDrawer({
            x: 380.5,
            y: 60,
            size: 10.5,
            color: rgb(
                secondaryRGB.r / 255,
                secondaryRGB.g / 255,
                secondaryRGB.b / 255,
            ),
        }),
        new TextDrawer({
            text: '2',
            size: 14,
            font: fonts.mvnBoldPdfFont,
            x: 377,
            y: 56,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'Reçu fiscal',
            size: 14,
            font: fonts.mvnMediumPdfFont,
            x: 400,
            y: 56,
            color: rgb(0, 0, 0),
        }),
        new ImageDrawer({
            url: note,
            width: 65.36,
            height: 86.62,
            x: 290,
            y: 30,
        }),
        new TextDrawer({
            text: '*',
            size: 32,
            font: fonts.mvnMediumPdfFont,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
            x: 385,
            y: 22,
        }),
        new TextDrawer({
            text: "-75% pour les personnes assujetties à l'IFI",
            maxWidth: 200,
            size: 14,
            font: fonts.mvnMediumPdfFont,
            x: 400,
            y: 36,
            lineHeight: 14,
        }),
    ];

    return [page1];
}
