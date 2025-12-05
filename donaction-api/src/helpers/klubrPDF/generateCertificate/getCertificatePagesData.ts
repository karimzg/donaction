import { format, parseISO } from 'date-fns';
import { MavenFonts } from '../funcs/installFonts';
import TextDrawer from '../entities/TextDrawer';
import RectangleDrawer from '../entities/RectangleDrawer';
import TextBlockDrawer from '../entities/TextBlockDrawer';
import ImageDrawer from '../entities/ImageDrawer';
import path from 'path';
import { rgb } from 'pdf-lib';
import { PageElement } from '../entities/_types';
import { KlubDonEntity } from '../../../_types';

const logoKlubr = path.join(
    __dirname,
    '../../../../../public/assets/icons/logo.png',
);
const bgKlubr = path.join(
    __dirname,
    '../../../../../public/assets/icons/backgroundKlubr.svg',
);

interface IGetCertificatePagesData {
    height: number;
    width: number;
    HPadding: number;
    VPadding: number;
    fonts: MavenFonts;
    don: KlubDonEntity;
}
export default async function getCertificatePagesData({
    height,
    width,
    HPadding,
    VPadding,
    fonts,
    don,
}: IGetCertificatePagesData): Promise<Array<Array<PageElement>>> {
    const {
        datePaiment,
        montant,
        attestationNumber,
        klubDonateur,
        klubr,
        klub_projet,
        ...rest
    } = don;

    const formattedDate = format(parseISO(datePaiment as string), 'dd/MM/yyyy');
    const formattedDateHour =
        format(parseISO(datePaiment as string), 'dd/MM/yyyy') +
        ' à ' +
        format(parseISO(datePaiment as string), 'HH:mm:ss');
    const professionalTextDrawer =
        rest?.estOrganisme && rest?.withTaxReduction
            ? [
                  new TextDrawer({
                      text:
                          `${klubDonateur?.raisonSocial} (${klubDonateur.formeJuridique})` ||
                          '',
                      size: 12,
                      font: fonts.mvnMediumPdfFont,
                  }),
                  new TextDrawer({
                      text: `SIREN: ${klubDonateur?.SIREN}` || '',
                      size: 12,
                      font: fonts.mvnMediumPdfFont,
                  }),
              ]
            : [];

    const recapList = () => {
        let list = [{ title: 'Don', amount: montant }];
        if (rest.klub_don_contribution) {
            list.push({
                title: 'Soutien à la plateforme Klubr',
                amount: rest.klub_don_contribution.montant,
            });
        }
        let y = -50;
        const newList = list.reduce((acc, curr) => {
            y += 50;
            return [
                ...acc,
                new RectangleDrawer({
                    x: HPadding,
                    y: height - VPadding - 400 - y,
                    height: 0.5,
                    width: width - HPadding * 2,
                    color: rgb(0, 0, 0),
                    opacity: 0.28,
                }),
                new TextDrawer({
                    size: 14,
                    x: HPadding,
                    y: height - VPadding - 430 - y,
                    text: curr.title,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextBlockDrawer(
                    [
                        new TextDrawer({
                            size: 14,
                            text: `${curr.amount}€`,
                            font: fonts.mvnRegularPdfFont,
                        }),
                    ],
                    {
                        x: width - HPadding - 20,
                        y: height - VPadding - 430 - y,
                        isRtl: true,
                    },
                ),
            ];
        }, []);
        return [
            ...newList,
            new RectangleDrawer({
                x: HPadding,
                y: height - VPadding - 500 - y,
                height: 50,
                width: width - HPadding * 2,
                color: rgb(247 / 255, 247 / 255, 247 / 255),
                opacity: 0.8,
            }),
            new RectangleDrawer({
                x: HPadding,
                y: height - VPadding - 450 - y,
                height: 0.5,
                width: width - HPadding * 2,
                color: rgb(0, 0, 0),
                opacity: 0.28,
            }),
            new TextBlockDrawer(
                [
                    new TextDrawer({
                        size: 14,
                        text: `${montant + (rest?.klub_don_contribution?.montant || 0)}€`,
                        font: fonts.mvnBoldPdfFont,
                    }),
                ],
                {
                    x: width - HPadding - 20,
                    y: height - VPadding - 480 - y,
                    isRtl: true,
                },
            ),
            new TextDrawer({
                size: 14,
                text: 'Montant Total',
                x: width - HPadding - 250,
                y: height - VPadding - 480 - y,
                font: fonts.mvnBoldPdfFont,
            }),
        ];
    };

    const page1 = [
        new RectangleDrawer({
            x: 0,
            y: height - 348,
            height: 348,
            width: width,
            color: rgb(247 / 255, 247 / 255, 247 / 255),
            opacity: 0.8,
        }),
        new ImageDrawer({
            url: logoKlubr,
            x: HPadding,
            y: height - VPadding - 28,
            width: 102,
            height: 28,
        }),
        new ImageDrawer({
            url: bgKlubr,
            isSvg: true,
            svgWidth: 344,
            svgHeight: 96,
            x: 297.64 - 344 / 2,
            y: 170,
            width: 344,
            height: 96,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Attestation de paiement',
                    size: 18,
                    font: fonts.mvnBoldPdfFont,
                }),
                new TextDrawer({
                    text: attestationNumber,
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: formattedDate,
                    size: 14,
                    font: fonts.mvnMediumPdfFont,
                }),
                new TextDrawer({
                    text: 'Payé',
                    size: 14,
                    color: rgb(0, 135 / 255, 0),
                    font: fonts.mvnMediumPdfFont,
                }),
            ],
            {
                x: width - HPadding,
                y: height - VPadding - 15,
                isRtl: true,
            },
        ),
        new RectangleDrawer({
            x: HPadding,
            y: height - VPadding - 100,
            height: 0.5,
            width: width - HPadding * 2,
            color: rgb(0, 0, 0),
            opacity: 0.28,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Contributeur',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: `${don?.withTaxReduction ? klubDonateur?.civilite || '' : ''} ${
                        klubDonateur?.prenom || ''
                    } ${klubDonateur?.nom || ''}`,
                    size: 12,
                    font: fonts.mvnMediumPdfFont,
                }),
                ...professionalTextDrawer,
                ...(rest?.withTaxReduction
                    ? [
                          new TextDrawer({
                              text: `${klubDonateur?.adresse || ''} ${
                                  klubDonateur?.adresse2 || ''
                              }`,
                              size: 12,
                              font: fonts.mvnMediumPdfFont,
                          }),
                          new TextDrawer({
                              text: `${klubDonateur?.cp || ''} ${
                                  klubDonateur?.ville || ''
                              }, ${klubDonateur?.pays || ''}`,
                              size: 12,
                              font: fonts.mvnMediumPdfFont,
                          }),
                          new TextDrawer({
                              text: klubDonateur?.tel || '',
                              size: 12,
                              font: fonts.mvnMediumPdfFont,
                          }),
                      ]
                    : []),
            ],
            {
                x: HPadding,
                y: height - VPadding - 146,
                isRtl: false,
                extraLineHeight: 3,
            },
        ),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Bénéficiaire',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: klubr?.denomination || '',
                    size: 12,
                    font: fonts.mvnMediumPdfFont,
                }),
                new TextDrawer({
                    text: klubr?.siegeSocialAdresse || '',
                    size: 12,
                    font: fonts.mvnMediumPdfFont,
                }),
                new TextDrawer({
                    text: `${klubr?.siegeSocialCP || ''} ${
                        klubr?.siegeSocialVille || ''
                    }`,
                    size: 12,
                    font: fonts.mvnMediumPdfFont,
                }),
            ],
            {
                x: width - HPadding,
                y: height - VPadding - 146,
                isRtl: true,
                extraLineHeight: 3,
            },
        ),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Date de paiement',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: formattedDateHour,
                    size: 12,
                    font: fonts.mvnMediumPdfFont,
                }),
            ],
            {
                x: HPadding,
                y: height - VPadding - 285,
                isRtl: false,
                extraLineHeight: 3,
            },
        ),
        new TextDrawer({
            size: 14,
            x: HPadding,
            y: height - VPadding - 375,
            text: 'Transaction',
            font: fonts.mvnSemiBoldPdfFont,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    size: 14,
                    text: 'Montant',
                    font: fonts.mvnSemiBoldPdfFont,
                }),
            ],
            {
                x: width - HPadding - 20,
                y: height - VPadding - 375,
                isRtl: true,
            },
        ),
        ...recapList(),
        new TextDrawer({
            text: rest.withTaxReduction
                ? `* Don en tant que ${
                      rest?.estOrganisme ? 'professionnel' : 'particulier'
                  } ouvrant droit à une réduction d'impôts car il remplit les conditions générales prévues à l'article ${
                      rest?.estOrganisme ? '238 bis' : '200'
                  } du code général des impôts.`
                : "*Le donateur n'a pas souhaité le bénéfice de la réduction d'impôt au titre du mécénat",
            size: 10,
            maxWidth: 500,
            font: fonts.mvnRegularPdfFont,
            lineHeight: 10,
            x: HPadding,
            y: height - VPadding - 570,
        }),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Plateforme de collecte',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: 'FONDS KLUBR',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: '85 rue de la Tossée',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: '59599 TOURCOING',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: 'France',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
            ],
            {
                x: HPadding,
                y: height - VPadding - 700,
                isRtl: false,
                extraLineHeight: 3,
            },
        ),
        new TextBlockDrawer(
            [
                new TextDrawer({
                    text: 'Contact',
                    size: 14,
                    font: fonts.mvnSemiBoldPdfFont,
                }),
                new TextDrawer({
                    text: 'hello@klubr.fr9999',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: '+33 6 71 54 22 13',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
                new TextDrawer({
                    text: 'www.klubr.fr',
                    size: 12,
                    font: fonts.mvnRegularPdfFont,
                }),
            ],
            {
                x: width - HPadding,
                y: height - VPadding - 700,
                isRtl: true,
                extraLineHeight: 3,
            },
        ),
    ];

    return [page1];
}
