import { MavenFonts } from '../funcs/installFonts';
import { PageElement } from '../entities/_types';
import hexToRgb from '../funcs/hexToRgb';
import path from 'path';
import SvgPathDrawer from '../entities/SvgPathDrawer';
import { rgb, BlendMode } from 'pdf-lib';
import QRCode from 'qrcode';
import getStatsShapes from '../funcs/getStatsShapes';
import TextDrawer from '../entities/TextDrawer';
import CircleDrawer from '../entities/CircleDrawer';
import TextBlockDrawer from '../entities/TextBlockDrawer';
import RectangleDrawer from '../entities/RectangleDrawer';
import ImageDrawer from '../entities/ImageDrawer';
import isImage from '../funcs/isImage';
import { getMediaPath, MEDIAS_TRANSFORMATIONS } from '../../medias';

const logoKlubr = path.join(
    __dirname,
    '../../../../../public/assets/icons/logo.png',
);
const note = path.join(
    __dirname,
    '../../../../../public/assets/icons/note.png',
);

interface IGetClubPosterPagesData {
    height: number;
    width: number;
    HPadding: number;
    VPadding: number;
    fonts: MavenFonts;
    data: any; // TODO: type
}
export default async function getClubPosterPagesData({
    height,
    width,
    HPadding,
    VPadding,
    fonts,
    data,
}: IGetClubPosterPagesData): Promise<Array<Array<PageElement>>> {
    const primaryRGB = data?.poster_primary_color
        ? hexToRgb(data?.poster_primary_color)
        : data?.primary_color
          ? hexToRgb(data?.primary_color)
          : { r: 1, g: 1, b: 1 };
    const secondaryRGB = data?.secondary_color
        ? hexToRgb(data?.secondary_color)
        : { r: 1, g: 1, b: 1 };
    const shapes = [
        new SvgPathDrawer({
            path: 'M50 0 H545.28 L297.64 70 Z',
            x: 0,
            y: height,
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            path: 'M0 0 H250 L0 65 Z',
            x: 0,
            y: height,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
            opacity: 0.42,
        }),
        new SvgPathDrawer({
            path: 'M0 401 H297.64 L0 330 Z',
            x: 0,
            y: height,
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            path: 'M595.28 401 H297.64 L595.28 330 Z',
            x: 0,
            y: height,
            color: rgb(1, 1, 1),
        }),
        new SvgPathDrawer({
            path: 'M297.64 70 V330 L0 400 V140 Z',
            x: 0,
            y: height,
            color: rgb(
                secondaryRGB.r / 255,
                secondaryRGB.g / 255,
                secondaryRGB.b / 255,
            ),
        }),
    ];

    const qrCodeUrl = `https://klubr.fr/${data?.klubr?.slug}?PAYEMENT_FORM=true`;
    const qrCodeBuffer = await QRCode.toBuffer(
        `${qrCodeUrl}&utm_medium=poster&utm_source=${data?.klubr?.denomination}&utm_content=${qrCodeUrl}&utm_campaign=${data?.klubr?.slug}`,
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
    const stats = [
        ...getStatsShapes(primaryRGB, secondaryRGB, height),
        new TextDrawer({
            text: '66%',
            font: fonts.mvnBoldPdfFont,
            size: 18,
            color: rgb(0, 0, 0),
            x: 65,
            y: height - 475,
        }),
        new TextDrawer({
            text: 'Particulier (IRPP)',
            maxWidth: 150,
            font: fonts.mvnBoldPdfFont,
            size: 22,
            color: rgb(0, 0, 0),
            x: 145,
            y: height - 465,
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
            x: 257,
            y: height - 470,
        }),
        new TextDrawer({
            text: '60%',
            font: fonts.mvnBoldPdfFont,
            size: 18,
            color: rgb(0, 0, 0),
            x: 65,
            y: height - 595,
        }),
        new TextDrawer({
            text: 'Entreprise (IR ou IS)',
            maxWidth: 150,
            font: fonts.mvnBoldPdfFont,
            size: 22,
            color: rgb(0, 0, 0),
            x: 145,
            y: height - 595,
        }),
        new CircleDrawer({
            x: 290,
            y: height - 620,
            size: 10,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
        }),
        new TextDrawer({
            text: 'Réduction d’impôt',
            font: fonts.mvnBoldPdfFont,
            size: 22,
            color: rgb(
                primaryRGB.r / 255,
                primaryRGB.g / 255,
                primaryRGB.b / 255,
            ),
            x: 310,
            y: height - 625,
        }),
        new CircleDrawer({
            x: 290,
            y: height - 650,
            size: 10,
            color: rgb(
                secondaryRGB.r / 255,
                secondaryRGB.g / 255,
                secondaryRGB.b / 255,
            ),
        }),
        new CircleDrawer({
            x: 290,
            y: height - 650,
            size: 9,
            color: rgb(1, 1, 1),
        }),
        new TextDrawer({
            text: 'Coût Réel',
            font: fonts.mvnBoldPdfFont,
            size: 22,
            color: rgb(
                secondaryRGB.r / 255,
                secondaryRGB.g / 255,
                secondaryRGB.b / 255,
            ),
            x: 310,
            y: height - 655,
        }),
    ];
    //  Logo
    let logoWidth = 60 * (data?.klubr?.logo?.width / data?.klubr?.logo?.height);
    let logoHeight = 60;
    if (logoWidth > 150) {
        logoWidth = 150;
        logoHeight =
            150 * (data?.klubr?.logo?.height / data?.klubr?.logo?.width);
    }
    // Couverture
    const couvertureUrl = data?.poster_media
        ? isImage(data?.poster_media?.url)
            ? getMediaPath(
                  data?.poster_media,
                  MEDIAS_TRANSFORMATIONS.POSTER_IMG,
              )
            : data?.poster_media?.url
        : data?.couvertureMedia
          ? isImage(data?.couvertureMedia?.url)
              ? getMediaPath(
                    data?.couvertureMedia,
                    MEDIAS_TRANSFORMATIONS.POSTER_IMG,
                )
              : data?.couvertureMedia?.url
          : path.extname(data?.klubr?.logo.url) !== '.svg'
            ? getMediaPath(data?.klubr?.logo, MEDIAS_TRANSFORMATIONS.POSTER_IMG)
            : data?.klubr?.logo.url;

    const page1 = [
        new ImageDrawer({
            url: couvertureUrl,
            x: 0,
            y: height - 400,
            width: width,
            height: 400,
            svgWidth: (data?.couvertureMedia || data?.klubr?.logo)?.width,
            svgHeight: (data?.couvertureMedia || data?.klubr?.logo)?.height,
        }),
        new RectangleDrawer({
            x: 0,
            y: height - 400,
            height: 400,
            width: width,
            color: rgb(8 / 255, 35 / 255, 49 / 255),
            opacity: 0.52,
        }),
        ...shapes,
        ...stats,
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
            y: height - (logoHeight + 5),
            width: logoWidth,
            height: logoHeight,
        }),
        new ImageDrawer({
            url: logoKlubr,
            x: 180,
            y: height - 150,
            width: 102,
            height: 28,
        }),
        new TextDrawer({
            text: `Klubr et ${data?.klubr?.denomination}, c’est un Duo de choc ! On est tous les deux passionnées de sport et on a La même mission : Alors n’attends plus, Scannez le QR Code ci-dessous et soutenez ${data?.klubr?.denomination}`,
            x: 30,
            y: height - 190,
            maxWidth: 255,
            color: rgb(1, 1, 1),
            size: 16,
            font: fonts.mvnRegularPdfFont,
            lineHeight: 20,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Votre',
                    size: 32,
                    font: fonts.mvnBoldPdfFont,
                    color: rgb(1, 1, 1),
                }),
                new TextDrawer({
                    text: 'contribution',
                    size: 32,
                    font: fonts.mvnBoldPdfFont,
                    color: rgb(1, 1, 1),
                }),
                new TextDrawer({
                    text: 'nous sera',
                    size: 32,
                    font: fonts.mvnBoldPdfFont,
                    color: rgb(1, 1, 1),
                }),
                new TextDrawer({
                    text: 'précieuse',
                    size: 32,
                    font: fonts.mvnBoldPdfFont,
                    color: rgb(1, 1, 1),
                }),
            ],
            {
                x: 320,
                y: height - 150,
                isRtl: false,
                extraLineHeight: 0,
            },
        ),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Le Mécénat Sportif',
                    size: 32,
                    font: fonts.mvnBoldPdfFont,
                    color: rgb(38 / 255, 38 / 255, 38 / 255),
                }),
                new TextDrawer({
                    text: 'Un acte de générosité au \nservice du sport',
                    size: 18,
                    font: fonts.mvnSemiBoldPdfFont,
                    color: rgb(38 / 255, 38 / 255, 38 / 255),
                    lineHeight: 20,
                }),
            ],
            {
                x: 280,
                y: height - 450,
                isRtl: false,
                extraLineHeight: -10,
            },
        ),
        new TextDrawer({
            text: "Le mécénat est un acte philanthropique consistant à faire un don à un organisme d'intérêt général. Si l'organisme est éligible, les donateurs (particuliers et entreprises) bénéficient d'avantages fiscaux.",
            size: 14,
            x: 280,
            y: height - 530,
            font: fonts.mvnRegularPdfFont,
            color: rgb(38 / 255, 38 / 255, 38 / 255),
            maxWidth: 300,
            lineHeight: 16,
        }),
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
            text: 'www.klubr.fr',
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
            text: 'Reçu Fiscal',
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
